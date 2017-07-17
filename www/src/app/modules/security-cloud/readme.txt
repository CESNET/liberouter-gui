This module has a following hierarchy:
sc module:
    The topmost module which gathers the most important variables of the whole
    application: selected time, time window, window resolution and selected profile.
    This module only serves as router, interconnecting all submodules and
    providing them with those variables as well as intercepting changes made to
    these variables.
    The last thing it does is retrieving profile data and swapping profiles.
    
    !!! Please note the following: sc-graph-render is the ONLY module that is allowed
    to directly change values of time variables! sc-graph contain controls that
    allows time changes, but those elements just call public api of sc-graph-render
    submodule. Because of that reason, when user comes to scgui from nemea, all time
    values sent in URL are pumped into time variables by sc module (onInit), but they
    are sanitized by sc-graph-render onInit.
    
sc-graph:
    Auxiliary module calling sc-graph-render module (responsible for managing time
    selections and loading and displaying graph data). It contains a few control
    panels, but those only call underlying sc-graph-render public methods.
    
sc-graph-render:
    Core of the graph and cursor engine. This is where most of the magic happens.
    In future it is possible that cursor will have its own submodule, but since it's
    heavily interconnected with dygraph object I did not do it right away. Because
    of that, this module has the most complex interface.
    
sc-stats:
    This module only reacts to change of selected time interval and displays
    statistics for that interval.
    
sc-dbqry:
    This module basically ignores rest of the GUI, silently using selected time as
    a delimiter for queried files.
    
Shadow profiles:
    If a profile has type 'normal', user create a subprofile to it and a subprofile can be of type
    'shadow'. Ipfixcol does not export nfcapd files for shadow profiles, it only saves rrdgraphs.
    Querying shadow profile is still possible, though. The logic is following:
    queried nfcapd files are files of the parent, with custom filter which is based on the following:
    for each channel of the shadow profile:
        take its filter and make a conjunction with disjunction of all source channel filters
        then take this auxiliary filter and make a disjunction with a custom filter
    
    then pick all channels of parent profile and query them with custom filter