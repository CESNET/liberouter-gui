import { UsersModule } from './modules/users/users.module';
import { NemeaModule } from './modules/nemea/nemea.module';
import { FtasModule } from './modules/ftas/ftas.module';
import { SecurityCloudModule } from './modules/security-cloud/sc.module';
import { NerdModule } from './modules/nerd/nerd.module';

export const modules: Array<Object> = [
    NemeaModule,
    FtasModule,
    SecurityCloudModule,
    NerdModule,
    UsersModule
]
