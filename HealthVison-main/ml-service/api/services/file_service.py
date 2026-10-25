import requests
import os

def download_file(file_url:str):
    os.makedirs("temp_reports" , exist_ok=True)
    
    # Extract extension from URL
    ext = os.path.splitext(file_url.split('?')[0])[1]
    if not ext:
        ext = ".pdf"
        
    file_path = f"temp_reports/report{ext}"
    response = requests.get(file_url)

    if response.status_code != 200:
        raise Exception("Failed to download file")
    
    with open(file_path,"wb") as f:
        f.write(response.content)

    return file_path