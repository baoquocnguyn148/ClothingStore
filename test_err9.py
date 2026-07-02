import urllib.request
import urllib.error

try:
    req = urllib.request.Request('https://kroki.io/plantuml/png', data=open('diag_9.puml', 'rb').read(), method='POST')
    req.add_header('Content-Type', 'text/plain')
    req.add_header('User-Agent', 'Mozilla/5.0')
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
