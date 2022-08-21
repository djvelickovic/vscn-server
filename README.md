# VSCN Server

## Running

```bash
python3 -m venv venv
. venv/bin/activate

pip install flask
pip install packaging
pip install pymongo
pip install python-dotenv

FLASK_MONGO_DB_URL=<url goes here>
MONGODB_DATABASE_NAME="vscn"

flask --app vscns.app --debug run

```