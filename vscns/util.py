
def some(pred, _list) -> bool:
    return any(pred(i) for i in _list)


def every(pred, _list) -> bool:
    return all(pred(i) for i in _list)
