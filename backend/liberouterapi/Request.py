from flask import Request
from collections import OrderedDict
from flask import json


class RequestHandler(Request):
    """Extended Flask Request to provide JSON data with preserved data order.
    API is the same, but get_json() has additional keep_order parameter to specify
    if the order should be preserved. By default, the order is preserved in contrast
    to the standard Flask Request class.
    """

    _cached_json = Ellipsis

    def get_json(self, keep_order = True, force = False, silent = False, cache = True):
        """Parse and return the data as JSON. If the mimetype does not indicate
        JSON (:mimetype:`application/json`, see :meth:`is_json`), this returns
        ``None`` unless ``force`` is true. If parsing fails,
        :meth:`on_json_loading_failed` is called and its return value is used
        as the return value.
        :param keep_order: Keep order of the JSON elements in input data.
        :param force: Ignore the mimetype and always try to parse JSON.
        :param silent: Silence parsing errors and return ``None`` instead.
        :param cache: Store the parsed JSON to return for subsequent calls.
        """
        if not keep_order:
            return Request.get_json(self)

        if cache and self._cached_json is not Ellipsis:
            return self._cached_json

        if not (force or self.is_json):
            return None

        # We accept MIME charset against the specification as certain clients
        # have used this in the past. For responses, we assume that if the
        # charset is set then the data has been encoded correctly as well.
        charset = self.mimetype_params.get('charset')

        try:
            data = self.get_data(cache = cache)
            rv = json.loads(data, encoding = charset, object_pairs_hook = OrderedDict)
        except ValueError as e:
            if silent:
                rv = None
            else:
                rv = Request.on_json_loading_failed(self, e)

        if cache:
            self._cached_json = rv

        return rv
