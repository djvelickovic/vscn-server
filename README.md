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


Creating indexes for scan

connect to the database with mongosh and execute

```js

db.matchers.createIndex( { products: 1 } )
db.cve.createIndex( { id: 1 } )


```