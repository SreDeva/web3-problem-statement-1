import fitz  # PyMuPDF
import google.generativeai as genai
import os
from fastapi import FastAPI, UploadFile, File
import uvicorn

app = FastAPI()

def extract_pdf_text(pdf_path):
    # Open the PDF file
    document = fitz.open(pdf_path)
    
    text = ""
    # Iterate through all the pages
    for page_num in range(document.page_count):
        page = document.load_page(page_num)  # Load the page
        text += page.get_text()  # Extract text from page
        text += "\n"
    
    # Close the document
    document.close()
    
    return text

def get_validity(policy_pdf, claim_pdf):
    policy_text = extract_pdf_text(policy_pdf)
    claim_text = extract_pdf_text(claim_pdf)

    genai.configure(api_key="AIzaSyAkk67Z_gv5mr0EPCKchvuj2LcOV5F1Ark")

    model = genai.GenerativeModel(model_name="gemini-1.5-flash",
                                  generation_config={"response_mime_type": "application/json"})
    response = model.generate_content(f"this is a claim text : {claim_text} and this is a policy text : {policy_text} check details are same and date of incident and date in section 4 lies between policy start and expiry date also check whether the CLAIMANT'S DECLARATION is according to the policy regulations and type of incident is according to the coverages provide valid or invalid in json format with two keys valid(bool) and reason(string)")
    return response.text

@app.post("/validate-claim/")
async def validate_claim(policy_pdf: UploadFile = File(...), claim_pdf: UploadFile = File(...)):
    # Save the uploaded files
    policy_path = f"temp_{policy_pdf.filename}"
    claim_path = f"temp_{claim_pdf.filename}"

    with open(policy_path, "wb") as f:
        f.write(await policy_pdf.read())
    
    with open(claim_path, "wb") as f:
        f.write(await claim_pdf.read())

    # Get validity response
    validity_response = get_validity(policy_path, claim_path)

    # Delete the temporary files
    os.remove(policy_path)
    os.remove(claim_path)

    return {"validity_response": validity_response}

# Example usage
if __name__ == "_main_":
    uvicorn.run(app,port=8000)