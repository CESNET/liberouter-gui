#!/bin/python3

import json
import os
import re
import logging
import fnmatch
import glob

log = logging.getLogger("Bootstrap")

BASE_PATH = os.path.dirname(os.path.realpath(__file__))

class Deps():
    """
    Indices for the dependency list. Cannot use enum because these are used as indices.
    """
    NPM = 0
    NGC = 1
    PIP = 2

class Unify():
    def __init__(self):
        pass

    @staticmethod
    def arrays(dst, add):
        """
        Adds items from adder into base. If base already contains that value, skip it
        """
        for item in add:
            if not item in dst:
                dst.append(item)

    @staticmethod
    def dicts(dst, add):
        """
        Adds items from adder into base. If base already contains a key from adder and value is
        different, then it is overwritten by value from adder and conflict is noted. As a final step,
        dictionary with all conflicts is returned.
        """
        conflicts = None
        for key in add:
            if key in dst and add[key] != dst[key]:
                if conflicts is None:
                    conflicts = {}
                conflicts[key] = add[key]
            dst[key] = add[key]
        return conflicts

def mergeNpmDeps(base, module, modulename):
    """
    Adds dependencies from module into base and reports any conflicts that happen.
    """
    items = ['dependencies', 'devDependencies']

    for item in items:
        base_dep = base.get(item, None)
        module_dep = module.get(item, None)
        conflicts = None
        if base_dep and module_dep:
            conflicts = Unify.dicts(base_dep, module_dep)

        if conflicts:
            log.warn('%s has following NPM conflicts:', modulename)

            for key in conflicts:
                log.warn('\t' + key + ' with version ' + conflicts[key])

def mergeNgcDeps(base, module):
    """
    Adds styles, scripts and assets for angular app from module into base. No conflicts are reported
    as I can't detect any at the moment.
    """
    items = ['assets', 'styles', 'scripts']

    for item in items:
        # NOTE: lgui is just a single app, so it's always on index 0
        Unify.arrays(base['apps'][0][item], module['apps'][0][item])

def mergePipDeps(base, module, modulename):
    """
    Adds dependencies from module into base and reports any conflicts that happen.
    """
    conflicts = Unify.dicts(base, module)

    if conflicts:
        log.warn(modulename + ' has following PIP conflicts:')

        for key in conflicts:
            log.warn('\t' + key + ' with version ' + conflicts[key])

def loadReqs(path):
    """
    Load PIP requirement file. It is list of key==value lines.
    """
    result = {}
    with open(path, 'r') as fh:
        for line in fh:
            spl = line.strip().split('==')
            result[spl[0]] = spl[1]
    return result

def loadJSON(path):
    result = None
    with open(path, 'r') as fh:
        result = json.load(fh)
    return result

def loadBaseDeps():
    """
    Load all three base dependency files.
    """
    deps = [None, None, None]
    deps[Deps.NPM] = loadJSON(os.path.join(BASE_PATH, 'frontend/package.base.json'))
    deps[Deps.NGC] = loadJSON(os.path.join(BASE_PATH, 'frontend/.angular-cli.base.json'))
    deps[Deps.PIP] = loadReqs(os.path.join(BASE_PATH, 'backend/requirements.base.txt'))
    return deps

def getImmediateSubdirs(a_dir):
    """
    Get a list of subdirectories of given directory
    """
    return [name for name in os.listdir(a_dir)
        if os.path.isdir(os.path.join(a_dir, name))]

def updateDeps(basedeps, deplist, modulename):
    """
    Scan deplist for dependency defined by the module and then merges that dependency file with
    basedeps.
    """
    if 'npm' in deplist:
        npmd = loadJSON(os.path.join(BASE_PATH, 'modules', modulename, deplist['npm']))
        mergeNpmDeps(basedeps[Deps.NPM], npmd, modulename)

    if 'ngc' in deplist:
        ngcd = loadJSON(os.path.join(BASE_PATH, 'modules', modulename, deplist['ngc']))
        mergeNgcDeps(basedeps[Deps.NGC], ngcd)

    if 'pip' in deplist:
        pipd = loadReqs(os.path.join(BASE_PATH, 'modules', modulename, deplist['pip']))
        mergePipDeps(basedeps[Deps.PIP], pipd, modulename)

def updateModuleList(moduleList, config, modulename):
    """
    Update moduleList with all info needed for module registration.
    """
    if not 'module' in config:
        log.warn(modulename + ': No "module" section in config, skipping module')
        return False

    if not 'frontend' in config['module']:
        log.warn(modulename + ': No "frontend" key in config, skipping module')
        return False

    if not 'class' in config['module']:
        log.warn(modulename + ': No "class" key in config, skipping module')
        return False

    if not 'file' in config['module']:
        log.warn(modulename + ': No "file" key in config, skipping module')
        return False

    moduleList.append({
        'folder': modulename,
        'class': config['module']['class'],
        'file': config['module']['file'],
        'name' : config['module']['name']
        })
    return True

def createSymlink(src, dst):
    log.debug("Symlinking src: %s, dst: %s" % (src, dst))
    try:
        # Using lexists to detect and remove broken symlinks as well as removing symlinks that
        # will be overwritten.
        if os.path.lexists(dst):
            os.remove(dst)
        os.symlink(src, dst)
    except (OSError, IOError) as e: # Insufficient privileges
        log.warn("Cannot create symlink (target: %s) %s" % (src, str(e)))

def bootstrapModules(basedeps, moduleList):
    """
    Build moduleList, update basedeps with module specific dependencies and create symlinks into
    module folders of both backend and frontend.
    """
    log.info("Bootstrapping modules")
    #modules = getImmediateSubdirs('modules')
    cfgfiles = glob.glob(os.path.join(BASE_PATH, 'modules', '**/*config.json'), recursive=True)

    if os.path.join(BASE_PATH,"modules/app.config.json"):
        cfgfiles.remove(os.path.join(BASE_PATH,"modules/app.config.json"))

    for cfgpath in cfgfiles:
        try:
            config = None

            try:
                with open(cfgpath, 'r') as fh:
                    config = json.load(fh)
            except (OSError, IOError):
                log.warn(module + ': Cannot find ' + cfgpath + ', skipping module')
                continue

            try:
                name = config['module']['name']
            except KeyError as e:
                log.warn("Cannot find name in module, skipping config %s" % cfgpath)

            if not updateModuleList(moduleList, config, name):
                continue

            module_dir = os.path.dirname(cfgpath)

            # Module might not have dependencies, their absence is not an error
            if 'dependencies' in config:
                updateDeps(basedeps, config['dependencies'], name)

            if 'backend' in config['module']:
                src = os.path.join(module_dir, config['module']['backend'])
                dst = os.path.join(BASE_PATH, 'backend/liberouterapi/modules', name)
                createSymlink(src, dst)

            if 'assets' in config['module']:
                """
                Link assets for frontend to frontend/src/assets folder
                Each module must contain key 'name' and 'assets', after importing assets are available
                via /name/ path on frontend
                """
                if not 'name' in config['module']:
                    log.warn("No 'name' specified, skipping inclusion of assets.")
                    break
                src = os.path.join(module_dir, config['module']['assets'])
                dst = os.path.join(BASE_PATH, 'frontend/src/assets', name)
                createSymlink(src, dst)

            # Frontend key presence tested by updateModuleList
            src = os.path.join(module_dir, config['module']['frontend'])
            dst = os.path.join(BASE_PATH, 'frontend/src/app/modules', name)

            createSymlink(src, dst)
        except Exception as e:
            log.warn("Skipping configuration in {0}. Reason: {1} ({2})"
                    .format(cfgpath, str(e), type(e)))
            continue

def registerModules(modules):
    """
    Create a file 'frontend/src/app/modules.ts' and link all imported modules in it.
    """
    log.info("Registering modules")
    with open(os.path.join(BASE_PATH, 'frontend/src/app/modules.ts'), 'w') as fh:
        fh.write("// This file is generated using bootstrap.py\n"\
                "// DO NOT EDIT THIS FILE\n")
        for module in modules:
            file = re.sub('\.ts$', '', module['file'])
            path = os.path.join('modules', module['folder'], file)
            fh.write('import { ' + module['class'] + ' } from \'./' + path + '\';\n')

        fh.write('\n')
        fh.write('export const modules: Array<Object> = [')

        fh.write(modules[0]['class'])
        for i in range(1, len(modules)):
            fh.write(',' + modules[i]['class'])
        fh.write(']')

def saveDependencies(deps):
    """
    Export dependencies into their designated files.
    """
    log.info("Exporting dependencies")
    with open(os.path.join(BASE_PATH, 'frontend/package.json'), 'w') as fh:
        json.dump(deps[Deps.NPM], fh, indent = 4)

    with open(os.path.join(BASE_PATH, 'frontend/.angular-cli.json'), 'w') as fh:
        json.dump(deps[Deps.NGC], fh, indent = 4)

    with open(os.path.join(BASE_PATH, 'backend/requirements.txt'), 'w') as fh:
        for key, value in deps[Deps.PIP].items():
            fh.write(key + '==' + value + '\n')

def applicationConfig(modules):
    """
    Create assets/config.json file with base of app.config.json
    """
    log.info("Creating application config")
    with open(os.path.join(BASE_PATH, 'modules/app.config.json')) as f:
        # Open module/app.config.json and load it
        # Perform key checks for created dictionary
        config = json.load(f)

        if 'logo' not in config:
            log.error('Missing key "logo" in modules/app.config.json')
            raise KeyError('missing "logo" in app.config.json')
        if 'name' not in config:
            log.error('Missing key "name" in modules/app.config.json')
            raise KeyError('missing "name" in app.config.json')

        if 'assets' not in config:
            log.warn('Missing key "assets" in modules/app.config.json, skipping assets inclusion')
        else:
            createSymlink(os.path.join(BASE_PATH, 'modules', config['assets']['input']),
                os.path.join(BASE_PATH, 'frontend/src/assets', config['assets']['output']))

        if 'modules' in config:
            log.warn("'modules' already present in config, skipping")
        else:
            config['modules'] = dict()

            for module in modules:
                config['modules'][module['name']] = { 'enabled' : True }

        with open(os.path.join(BASE_PATH, 'frontend/src/assets/config.json'), 'w+') as c:
            log.info("Exporting application config")
            json.dump(config, c, indent = 4)

# =====================
# MAIN CODE STARTS HERE
# =====================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Process dependencies in backend and frontend." \
            "If you desire to install only SQL or MongoDB support (not both) use available args."
            )

    parser.add_argument('--with-sql', action='store_true', help="Install with SQL support only")
    parser.add_argument('--with-mongo', action='store_true', help="Install with MongoDB support only")
    parser.add_argument('--verbose','-v', action='store_true', help="Verbose logging")

    args = vars(parser.parse_args())

    if args['verbose'] == True:
        # Enable verbose logging (set log level to debug)
        logging.basicConfig(level=logging.DEBUG)
        log.info("Verbose logging enabled")
    else:
        logging.basicConfig()

    depsBase = loadBaseDeps()
    moduleList = []

    try:
        bootstrapModules(depsBase, moduleList)

        # Users module is always present
        moduleList.append({
            'folder': 'users',
            'class': 'UsersModule',
            'file': 'users.module.ts',
            'name' : 'users'
            })

        if args["with_mongo"] or args["with_sql"]:
            # Remove mongo or flask-sqlalchemy if one of the args is present
            if args["with_mongo"] == False:
                # Remove pymongo
                del depsBase[Deps.PIP]["pymongo"]

            if args["with_sql"] == False:
                # Remove SQLAlchemy
                del depsBase[Deps.PIP]["Flask-SQLAlchemy"]

        registerModules(moduleList)
        applicationConfig(moduleList)
        saveDependencies(depsBase)

    except (OSError, IOError) as e:
        log.error(str(e))
