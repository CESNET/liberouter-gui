/**
 *  Class for holding application wide configuration. This configuration should be loaded by the root
 *  component on the init step of the whole app. Route is /scgui/config
 */
export class AppConfig {
    historicData: boolean;
    useLocalTime: boolean;
}
