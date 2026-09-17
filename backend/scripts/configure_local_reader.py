"""Set the local catalog reader password without putting it in a migration."""

import os
import secrets
from pathlib import Path
from urllib.parse import urlsplit

import psycopg
from psycopg import sql


def main() -> None:
    admin_url = os.getenv(
        "LOCAL_ADMIN_DATABASE_URL",
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    )
    reader_password = os.getenv("CATALOG_READER_PASSWORD") or secrets.token_urlsafe(32)
    parsed = urlsplit(admin_url)
    if parsed.hostname not in {"127.0.0.1", "localhost"} or parsed.port != 54322:
        raise SystemExit("Refusing to configure a database outside local Supabase port 54322")
    if not reader_password:
        raise SystemExit("CATALOG_READER_PASSWORD must not be empty")
    with psycopg.connect(admin_url) as connection:
        connection.execute(
            sql.SQL("alter role catalog_reader login password {}").format(
                sql.Literal(reader_password)
            )
        )
    local_env = Path(__file__).parents[1] / ".env.local"
    local_env.write_text(
        "# Generated for disposable local Supabase only. Never commit this file.\n"
        "APP_ENV=local\n"
        "ENABLE_DEV_CATALOG=1\n"
        f"CATALOG_DATABASE_URL=postgresql://catalog_reader:{reader_password}@127.0.0.1:54322/postgres\n"
        f"TEST_DATABASE_URL={admin_url}\n"
    )
    local_env.chmod(0o600)
    print("Configured the disposable local catalog reader role")


if __name__ == "__main__":
    main()
