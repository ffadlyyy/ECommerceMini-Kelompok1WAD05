from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=5, max_length=1000)

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    product_id: int
    user_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
