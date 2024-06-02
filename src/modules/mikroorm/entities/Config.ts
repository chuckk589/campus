import { Entity, EntityRepository, EntityRepositoryType, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { UpdateConfigDto } from 'src/modules/status/dto/update-config.dto';

@Entity({ repository: () => ConfigRepository })
export class Config {
  [EntityRepositoryType]?: ConfigRepository;

  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  name?: string;

  @Property({ length: 512, nullable: true })
  value?: string;

  @Property({ length: 255, nullable: true })
  description?: string;

  @Property({ length: 255, nullable: true })
  category?: string;
}

export class ConfigRepository extends EntityRepository<Config> {
  private secrets = ['OPENAI_API_KEY'];

  async safeUpdate(id: number, updateConfigDto: UpdateConfigDto): Promise<Config | null> {
    const config = await this.findOne({ id });
    if (!config) {
      return null;
    }
    if (this.secrets.includes(config.name) && !updateConfigDto.value) {
      return null;
    }
    if (config.name == 'QUESTION_TIME') {
      const result = updateConfigDto.value.match(/^\d*-\d*$/);
      if (!result) {
        return null;
      } else {
        config.value = updateConfigDto.value;
      }
    } else {
      config.value = updateConfigDto.value;
    }
    config.description = updateConfigDto.description;
    return config;
  }
}
