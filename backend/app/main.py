import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app(*, local_catalog: bool | None = None) -> FastAPI:
    application = FastAPI(title="DishWise API", docs_url=None, redoc_url=None, openapi_url=None)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")],
        allow_methods=["GET"],
        allow_headers=[],
    )

    if local_catalog is None:
        local_catalog = (
            os.getenv("APP_ENV") == "local"
            and os.getenv("ENABLE_DEV_CATALOG") == "1"
            and not os.getenv("VERCEL")
        )
    if local_catalog:
        from app.routes.dishes import router as dishes_router

        application.include_router(dishes_router)

    @application.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
