# OCR Setup for Receipt Processing

This application uses Tesseract OCR and Python for optical character recognition of petrol pump receipts.

## Prerequisites

1. Python 3.8+ installed on your system
2. Tesseract OCR installed on your system

## Setup Steps

### 1. Tesseract OCR Installation

#### Windows
1. Download and install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to the default location (C:\Program Files\Tesseract-OCR)
3. Add Tesseract to your PATH: 
   - Right-click on "This PC" or "My Computer" and select "Properties"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under System Variables, find "Path" and click "Edit"
   - Click "New" and add `C:\Program Files\Tesseract-OCR`
   - Click "OK" to close all dialogs

#### Mac
```bash
brew install tesseract
```

#### Linux
```bash
sudo apt-get install tesseract-ocr
```

### 2. Python Dependencies Installation

From the project root, install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. Verify Installation

Run the dependency checker script to verify all dependencies are correctly installed:

```bash
python check_python_deps.py
```

If any dependencies are missing, follow the instructions provided by the checker.

## Configuration

If Python is installed with a different name on your system (e.g., `python3` instead of `python`), you can configure the executable by setting the `PYTHON_EXECUTABLE` environment variable in your `.env.local` file:

```
PYTHON_EXECUTABLE=python3
```

## Testing the OCR

To test if the OCR is working correctly:

1. Place a sample receipt image in the `public/uploads` directory
2. Run the following command from the project root:

```bash
python lib/receipt_processor.py public/uploads/your-receipt-image.jpg
```

This should output the extracted data in JSON format.

## Troubleshooting

### Common Issues

1. **"pytesseract.pytesseract.TesseractNotFoundError: tesseract is not installed or it's not in your PATH"**
   - Make sure Tesseract is installed and added to your PATH
   - Check if Tesseract works by running `tesseract --version` in your terminal
   - On Windows, check if the path in `receipt_processor.py` matches your Tesseract installation path

2. **"ModuleNotFoundError: No module named 'cv2'"**
   - Make sure you've installed all dependencies: `pip install -r requirements.txt`
   - Try installing OpenCV separately: `pip install opencv-python`

3. **No text being extracted from images**
   - Check the image quality - make sure it's clear and well-lit
   - Try preprocessing the image manually (adjust contrast, brightness)
   - Experiment with different preprocessing settings in `preprocess_image()` function

4. **Script runs but extracts incorrect data**
   - Examine the extracted text (add a print statement for the raw text in the Python script)
   - Adjust the regex patterns in `extract_receipt_data()` to match your receipt format

### Need Further Help?

If you're still having issues, please:
1. Run the dependency checker: `python check_python_deps.py`
2. Check the server logs for detailed error messages
3. Try processing a receipt manually with the Python script and report any errors 