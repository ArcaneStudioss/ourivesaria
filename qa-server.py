from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(Path(__file__).parent/'dist'),**kw)
 def send_error(self,code,message=None,explain=None):
  if code==404:
   data=(Path(__file__).parent/'dist/404.html').read_bytes();self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
  else:super().send_error(code,message,explain)
ThreadingHTTPServer(('0.0.0.0',8080),Handler).serve_forever()
