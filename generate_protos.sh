#!/bin/bash
set -e  # Exit on error

# Get the directory where this script is located
THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define paths with absolute references
MONOREPO_PROTO_DIR="/home/brian/Code/swarm/robot/ros2_interfaces"
OUTPUT_DIR="${THIS_SCRIPT_DIR}/src/protos/generated"

# Ensure output directory exists
mkdir -p "${OUTPUT_DIR}"

# First, make sure ts-proto is installed
if [ ! -f "${THIS_SCRIPT_DIR}/node_modules/.bin/protoc-gen-ts_proto" ]; then
    echo "Installing ts-proto..."
    npm install --save-dev ts-proto
fi

# Collect all proto directories dynamically
PROTO_PATHS=$(find "${MONOREPO_PROTO_DIR}" -type d | awk '{print "--proto_path=" $1}' | tr '\n' ' ')

# Change to monorepo directory to ensure consistent paths
cd "${MONOREPO_PROTO_DIR}" || { echo "❌ Failed to change to ${MONOREPO_PROTO_DIR}"; exit 1; }

# Collect all .proto files, ensuring paths are relative
PROTO_FILES=$(find . -name "*.proto" -printf "%P\n" | sort | uniq)

# Change back to original directory
cd "${THIS_SCRIPT_DIR}" || { echo "❌ Failed to change back to ${THIS_SCRIPT_DIR}"; exit 1; }

# Ensure we have proto files
if [[ -z "${PROTO_FILES}" ]]; then
    echo "❌ No .proto files found in ${MONOREPO_PROTO_DIR}!"
    exit 1
fi

echo "Compiling all .proto files from ${MONOREPO_PROTO_DIR} into TypeScript..."

# Create a log file for warnings
WARNING_LOG="${THIS_SCRIPT_DIR}/proto_warnings.log"
> "${WARNING_LOG}"  # Clear the log file

# Counter for files processed
TOTAL_FILES=0
FILES_WITH_WARNINGS=0

# Process all proto files and redirect ALL output to the log file
for PROTO_FILE in ${PROTO_FILES}; do
    echo "🚀 Compiling: ${PROTO_FILE}..."
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    # Redirect both stdout and stderr to the log file for this specific file
    {
        echo "--------- Compiling ${PROTO_FILE} ---------"
        protoc \
            ${PROTO_PATHS} \
            --plugin=protoc-gen-ts_proto="$(realpath "${THIS_SCRIPT_DIR}/node_modules/.bin/protoc-gen-ts_proto")" \
            --ts_proto_out="${OUTPUT_DIR}" \
            --ts_proto_opt=esModuleInterop=true \
            --ts_proto_opt=outputServices=grpc-js \
            --ts_proto_opt=env=node \
            --experimental_allow_proto3_optional \
            "${MONOREPO_PROTO_DIR}/${PROTO_FILE}" 2>&1
        
        EXIT_CODE=$?
        if [[ ${EXIT_CODE} -ne 0 ]]; then
            echo "❌ Error compiling ${PROTO_FILE}. See ${WARNING_LOG} for details."
            exit 1
        elif grep -q "warning:" <<< "$(tail -n 20 "${WARNING_LOG}")"; then
            FILES_WITH_WARNINGS=$((FILES_WITH_WARNINGS + 1))
        fi
    } >> "${WARNING_LOG}" 2>&1
done

# Display a simple summary at the end
echo "✅ Compiled ${TOTAL_FILES} protobuf files successfully."
if [[ ${FILES_WITH_WARNINGS} -gt 0 ]]; then
    echo "⚠️ ${FILES_WITH_WARNINGS} files had warnings. Details in ${WARNING_LOG}"
else
    echo "✅ No warnings encountered during compilation!"
fi

# Count generated files
TS_FILE_COUNT=$(find "${OUTPUT_DIR}" -name "*.ts" | wc -l)
echo "Output directory: ${OUTPUT_DIR}"
echo "Generated ${TS_FILE_COUNT} TypeScript files."