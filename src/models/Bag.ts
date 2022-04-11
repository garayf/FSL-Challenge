import { Id, RelationMappings } from 'objection';
import { Cuboid } from './Cuboid';
import Base from './Base';

export class Bag extends Base {
  id!: Id;
  volume!: number;
  title!: string;
  payloadVolume!: number;
  availableVolume!: number;
  cuboids?: Cuboid[] | undefined;

  static tableName = 'bags';

  static get relationMappings(): RelationMappings {
    return {
      cuboids: {
        relation: Base.HasManyRelation,
        modelClass: 'Cuboid',
        join: {
          from: 'bags.id',
          to: 'cuboids.bagId',
        },
      },
    };
  }
  $afterFind(): void {
    this.setPayloadVolume();
    this.setAvailableVolume();
  }
  private setPayloadVolume() {
    this.payloadVolume = 0;
    if (this.cuboids?.length) {
      this.cuboids.forEach((cubo) => {
        const cuboVolume = cubo.width * cubo.height * cubo.depth;
        this.payloadVolume += cuboVolume;
      });
    }
  }
  private setAvailableVolume() {
    this.availableVolume = this.volume;
    if (this.cuboids?.length) {
      // eslint-disable-next-line fp/no-let
      let cubosVolume = 0;
      this.cuboids.forEach((cubo) => {
        cubosVolume += cubo.height * cubo.width * cubo.depth;
      });
      this.availableVolume -= cubosVolume;
    }
  }
}

export default Bag;
