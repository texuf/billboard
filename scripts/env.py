import os

ENV_PRODUCTION = 'production'
ENV_FILENAME = '.env'
ENV_LOCK_FILENAME = '.env-requirements'
STUB = ''

def _get_dict(filename):
    retval = {}
    if os.path.isfile(filename):
        with open(filename) as f:
            content = f.read()
            for line in content.splitlines():
                kv = line.split('=')
                retval[kv[0]] = kv[1] if len(kv) > 1 else STUB
    return retval

def setup():
    if not os.path.isfile(ENV_FILENAME):
        env_lock = _get_dict(ENV_LOCK_FILENAME)
        with open(ENV_FILENAME, 'w') as f:
            for k, v in env_lock.items():
                f.write('%s=%s\n' % (k, v))

def load():
    env = _get_dict(ENV_FILENAME)
    for k,v in env.items():
        print("loading %s %s" % (k, v))
        os.environ[k] = v

def check():
    if not os.path.isfile(ENV_FILENAME):
        setup()
    env = _get_dict(ENV_FILENAME)
    env_lock = _get_dict(ENV_LOCK_FILENAME)
    for k in env_lock.keys():
        if k not in env.keys() or len(env[k]) == 0:
            raise Exception('Key [%s] not found in [%s]' % (key, ENV_FILENAME))

def freeze():
    if not os.path.isfile(ENV_FILENAME):
        raise Exception('file [%s] not found' % ENV_FILENAME)
    env = _get_dict(ENV_FILENAME)
    env_lock = _get_dict(ENV_LOCK_FILENAME)
    with open(ENV_LOCK_FILENAME, 'w') as f:
        for key, value in env.items():
            comment = value.split('#')
            value = env_lock.get(key, STUB).split('#')[0] # if the key exists in env_lock, use existing value, otherwise use debug string
            if len(comment) > 1:
                f.write('%s=%s #%s\n' % (key, value, comment[1]))
            else:
                f.write('%s=%s\n' % (key, value))

