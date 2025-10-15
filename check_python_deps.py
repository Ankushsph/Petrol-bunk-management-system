#!/usr/bin/env python
"""
Script to check if all required Python dependencies are installed
for the Petrol Pump Management OCR functionality.
"""

import sys

def check_dependency(module_name, required=True):
    try:
        __import__(module_name)
        print(f"[OK] {module_name} is installed")
        return True
    except ImportError:
        status = "REQUIRED" if required else "OPTIONAL"
        print(f"[FAIL] {module_name} is NOT installed [{status}]")
        return False

def check_tesseract():
    try:
        import pytesseract
        try:
            version = pytesseract.get_tesseract_version()
            print(f"[OK] Tesseract OCR is installed (version {version})")
            return True
        except pytesseract.TesseractNotFoundError:
            print("[FAIL] Tesseract OCR binary is NOT found")
            print("  Please install Tesseract OCR and make sure it's in your PATH")
            print("  See OCR-SETUP.md for instructions")
            return False
    except ImportError:
        print("[FAIL] pytesseract module is NOT installed")
        return False

def main():
    print("Checking Python dependencies for OCR functionality...\n")
    
    # Check Python version
    py_version = sys.version_info
    print(f"Python version: {py_version.major}.{py_version.minor}.{py_version.micro}")
    
    if py_version.major < 3 or (py_version.major == 3 and py_version.minor < 8):
        print("[FAIL] Python 3.8+ is required")
        return False
    
    # Required dependencies
    deps_ok = True
    deps_ok &= check_dependency("cv2")  # OpenCV
    deps_ok &= check_dependency("PIL")  # Pillow
    deps_ok &= check_dependency("numpy")
    deps_ok &= check_tesseract()
    
    print("\nCheck complete!")
    
    if deps_ok:
        print("\nAll required dependencies are installed.")
        print("The OCR system should work properly.")
        return 0
    else:
        print("\nSome dependencies are missing.")
        print("Please install the missing dependencies before using the OCR feature.")
        print("See OCR-SETUP.md for instructions.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 