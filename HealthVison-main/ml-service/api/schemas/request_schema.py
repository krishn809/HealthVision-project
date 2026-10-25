from pydantic import BaseModel

class ReportRequest(BaseModel):
    report_id:str