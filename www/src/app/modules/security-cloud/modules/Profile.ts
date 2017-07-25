export class Channel {
    name: string; ///< Name of the channel
    filter: string; ///< Filter applied to all source channels
    sources: string[]; ///< Names of source channels
}

export class Profile {
    name: string; ///< Name of the profile
    type: string; ///< Type of the profile (normal/shadow)
    path: string; ///< Path to profile in a profile tree
    channels: Channel[]; ///< List of channels
    subprofiles: ProfileMap; ///< Map of all subprofiles
}

export class ProfileLink {
    name: string; ///< Name of the profile prepended by a number of slashes representing depth level in a profile tree
    path: string; ///< Original path to profile

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }
}

/**
 *  Internally, ProfileMap is object containing all profiles on a certain level
 *  of profile hierarchy. Each profile is indexed by it's name.
 */
export class ProfileMap {
    private data;

    constructor(data: Object) {
        this.data = new Array<Object>();
        for (const key in data) {
            this.data[key] = new Profile();
            this.data[key].name = data[key].name;
            this.data[key].type = data[key].type;
            this.data[key].path = data[key].path;
            this.data[key].channels = data[key].channels;
            this.data[key].subprofiles = new ProfileMap(data[key].subprofiles);
        }
    }

    /**
     *  @brief Get profile on a given path
     *
     *  @param [in] profilePath Path to profile
     *  @return Profile object
     */
    getProfile(profilePath: string): Profile {
        if (profilePath[0] === '/') {
            profilePath = profilePath.slice(1);
        }

        const b = profilePath.search('/');
        if (b === -1) {
            return this.data[profilePath];
        }

        const parentp: string = profilePath.substr(0, b);
        const restp: string = profilePath.substr(b + 1);

        return this.data[parentp].subprofiles.getProfile(restp);
    }

    /**
     *  @brief Get one dimensional list of profiles
     *
     *  @param [in] level Auxiliary variable. Call with empty string
     *  @return ProfileLink array
     */
    getLinkList(level: string): ProfileLink[] {
        const result: ProfileLink[] = [];

        for (const k in this.data) {
            result.push(new ProfileLink((level + ' ' + k), this.data[k].path));

            const aux: ProfileLink[] = this.data[k].subprofiles.getLinkList(level + '-');

            for (const p of aux) {
                result.push(p);
            }
        }

        return result;
    }
}
