import argparse
import os
from Functions import process_pdf_task, extract_summary, extract_topics_lda


def main():
    parser = argparse.ArgumentParser(description="Test PDF processing task.")
    parser.add_argument("--pdf", required=True, help="Path to the PDF file")

    args = parser.parse_args()

    pdf_path = args.pdf

    if not os.path.exists(pdf_path):
        print(f"Error: The file '{pdf_path}' does not exist.")
        return

    # Call the Celery task function directly (without Celery async execution)
    result = process_pdf_task(pdf_path)
    text = result["text"]
    topics = extract_topics_lda(text)
    print(text)
    print("\n=== Extracted Topics (LDA) ===")
    for idx, topic in enumerate(topics, 1):
        print(f"Topic {idx}: {topic}")

    print("\n=== PDF Processing Result ===")
    if result["status"] == "success":
        print("✅ Success!")
    else:
        print("❌ Error:", result["message"])


if __name__ == "__main__":
    main()
