#!/bin/python3

import json
from enum import Enum
import os
import re
import logging

logging.basicConfig()
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
        conflicts = Unify.dicts(base[item], module[item])

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
            spl = line.split('==')
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
    deps[Deps.NPM] = loadJSON('frontend/package.base.json')
    deps[Deps.NGC] = loadJSON('frontend/.angular-cli.base.json')
    deps[Deps.PIP] = loadReqs('backend/requirements.base.txt')
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
        npmd = loadJSON(os.path.join('modules', modulename, deplist['npm']))
        mergeNpmDeps(basedeps[Deps.NPM], npmd, modulename)

    if 'ngc' in deplist:
        ngcd = loadJSON(os.path.join('modules', modulename, deplist['ngc']))
        mergeNgcDeps(basedeps[Deps.NGC], ngcd)

    if 'pip' in deplist:
        pipd = loadReqs(os.path.join('modules', modulename, deplist['pip']))
        mergePipDeps(basedeps[Deps.PIP], pipd, modulename)

def updateModuleList(moduleList, config, modulename):
    """
    Update moduleList with all info needed for module registration.
    """
    if not 'module' in config:
        log.error(modulename + ': No "module" section in config, skipping module')
        return False

    if not 'frontend' in config['module']:
        log.error(modulename + ': No "frontend" key in config, skipping module')
        return False

    if not 'class' in config['module']:
        log.error(modulename + ': No "class" key in config, skipping module')
        return False

    if not 'file' in config['module']:
        log.error(modulename + ': No "file" key in config, skipping module')
        return False

    moduleList.append({'folder': modulename, 'class': config['module']['class'], 'file': config['module']['file']})
    return True

def createSymlink(src, dst):
    try:
        # Using lexists to detect and remove broken symlinks as well as removing symlinks that
        # will be overwritten.
        if os.path.lexists(dst):
            os.remove(dst)
        os.symlink(src, dst)
    except (OSError, IOError) as e: # Insufficient privileges
        log.warn(str(e))

def bootstrapModules(basedeps, moduleList):
    """
    Build moduleList, update basedeps with module specific dependencies and create symlinks into
    module folders of both backend and frontend.
    """
    modules = getImmediateSubdirs('modules')
    for module in modules:
        cfgpath = os.path.join('modules', module, 'config.json')
        config = None

        try:
            with open(cfgpath, 'r') as fh:
                config = json.load(fh)
        except (OSError, IOError):
            log.error(module + ': Cannot find ' + cfgpath + ', skipping module')
            continue

        if not updateModuleList(moduleList, config, module):
            continue

        # Module might not have dependencies, their absence is not an error
        if 'dependencies' in config:
            updateDeps(basedeps, config['dependencies'], module)

        if 'backend' in config['module']:
            src = os.path.join('../../../modules', module, config['module']['backend'])
            dst = os.path.join('backend/liberouterapi/modules', module)
            createSymlink(src, dst)

        # Frontend key presence tested by updateModuleList
        src = os.path.join('../../../../modules', module, config['module']['frontend'])
        dst = os.path.join('frontend/src/app/modules', module)
        createSymlink(src, dst)

def registerModules(modules):
    """
    Create a file 'frontend/src/app/modules.ts' and link all imported modules in it.
    """
    with open('frontend/src/app/modules.ts', 'w') as fh:
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
    with open('frontend/package.json', 'w') as fh:
        json.dump(deps[Deps.NPM], fh, indent = 4)

    with open('frontend/.angular-cli.json', 'w') as fh:
        json.dump(deps[Deps.NGC], fh, indent = 4)

    with open('backend/requirements.txt', 'w') as fh:
        for key, value in deps[Deps.PIP].items():
            fh.write(key + '==' + value + '\n')

# =====================
# MAIN CODE STARTS HERE
# =====================
if __name__ == "__main__":
    depsBase = loadBaseDeps()
    moduleList = []

    try:
        bootstrapModules(depsBase, moduleList)

        # Users module is always present
        moduleList.append({'folder': 'users', 'class': 'UsersModule', 'file': 'users.module.ts'})

        registerModules(moduleList)
        saveDependencies(depsBase)
    except (OSError, IOError) as e:
        log.error(str(e))
