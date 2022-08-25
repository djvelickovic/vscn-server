FROM python:3.10


COPY dist/vscns-1.0.0-py3-none-any.whl /vscns-1.0.0-py3-none-any.whl
COPY products-set.json /products-set.json
RUN pip install /vscns-1.0.0-py3-none-any.whl
RUN pip install gunicorn
CMD ["gunicorn", "-w", "4", "vscns.app:app", "-b", "0.0.0.0:11001"]