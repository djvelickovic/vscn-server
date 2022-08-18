# VSCN Server

## Running

```python
python3 -m venv venv
. venv/bin/activate

pip install flask
pip install packaging
pip install pymongo

export FLASK_MONGO_DB_URL=<url goes here>

flask --app vscns --debug run

```