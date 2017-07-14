import { ProfileMap, Channel } from './Profile';

export class ChannelSettings {
    name: string;
    checked: boolean;
    color: string;
}

export class ChannelSettingsBuilder {
    static init(profiles: ProfileMap, selectedProfile: string): ChannelSettings[] {
        // Get list of channels of a current profile
        const rawChannels: Channel[] = profiles.getProfile(selectedProfile).channels;

        const step: number = 360 / rawChannels.length;

        // Forget any previous content, create new array
        const result = new Array<ChannelSettings>(rawChannels.length);
        for (let i = 0; i < rawChannels.length; i++) {
            result[i] = {
                name: rawChannels[i].name,
                checked: true,
                color: 'hsl(' + String(step * i) + ', 75%, 50%'
            };
        }

        return result;
    }
}
