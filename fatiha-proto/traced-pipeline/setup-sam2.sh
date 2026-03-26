#!/bin/bash
# Traced Pipeline — SAM 2 Setup for Tawfeeq's WSL2 (dual RTX A6000)
# Run this on your local machine, NOT in the sandbox

set -e

echo "=== Traced Pipeline: SAM 2 Setup ==="

# Create conda env if it doesn't exist
if ! conda info --envs | grep -q "traced"; then
    echo "Creating conda environment 'traced'..."
    conda create -n traced python=3.12 -y
fi

echo "Activating traced environment..."
eval "$(conda shell.bash hook)"
conda activate traced

# Install PyTorch with CUDA
echo "Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

# Install SAM 2
echo "Installing SAM 2..."
pip install sam-2

# If pip install doesn't work, clone and install from source:
# git clone https://github.com/facebookresearch/sam2.git /var/lib/cookmom-workspace/sam2
# cd /var/lib/cookmom-workspace/sam2
# pip install -e ".[notebooks]"

# Download SAM 2 checkpoints (no gating required!)
echo "Downloading SAM 2 checkpoints..."
mkdir -p /var/lib/cookmom-workspace/sam2-checkpoints
cd /var/lib/cookmom-workspace/sam2-checkpoints

# sam2.1_hiera_large.pt — best quality, ~900MB
if [ ! -f sam2.1_hiera_large.pt ]; then
    echo "Downloading sam2.1_hiera_large.pt..."
    wget -q "https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt"
fi

# sam2.1_hiera_base_plus.pt — good balance, ~320MB
if [ ! -f sam2.1_hiera_base_plus.pt ]; then
    echo "Downloading sam2.1_hiera_base_plus.pt..."
    wget -q "https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_base_plus.pt"
fi

# Install other dependencies
echo "Installing pipeline dependencies..."
pip install opencv-python-headless pillow scipy

echo ""
echo "=== Setup complete ==="
echo "Test with:"
echo "  conda activate traced"
echo "  python extract-sam2.py --image ../szm-reference.jpg --output szm-extraction.json"
