export class Channel {
	name: string;
	filter: string;
	sources: string[];
}

export class Profile {
	name: string;
	type: string;
	path: string;
	channels: Channel[];
	subprofiles: ProfileMap;
}

export class ProfileLink {
	name: string;
	path: string;
	
	constructor(name: string, path: string) {
		this.name = name;
		this.path = path;
	}
}

export class ProfileMap {
	private data;
	
	constructor(data:Object) {
		this.data = data;
	}
	
	getProfile(profilePath: string) : Profile {
		if (profilePath[0] == '/') {
			profilePath = profilePath.slice(1);
		}
		
		let pname : string[] = profilePath.split('/', 1);
		if (pname.length == 1) {
			return this.data[pname[0]];
		}
		return this.data[pname[0]].subprofiles.getProfile(pname[1]);
	}
	
	getLinkList(level: string) : ProfileLink[] {
		console.log("entered");
		let result : ProfileLink[] = [];
		
		for(let k in this.data) {
			result.push(new ProfileLink((level + " " + k), this.data[k].path));
			
			level += "-";
			let aux : ProfileLink[] = this.data[k].subprofiles.getLinkList(level);
			
			for (let p of aux) {
				result.push(p);
			}
		}
		
		return result;
	}
}
