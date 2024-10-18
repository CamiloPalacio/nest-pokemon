import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

// Another way to import the Pokemon model
// import { PokemonService } from 'src/pokemon/pokemon.service';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    // private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const response = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon/?limit=300',
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    response.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = Number(segments[segments.length - 2]);
      pokemonToInsert.push({ name, no });
      // this.pokemonService.create({ name, no });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return response.results;
  }
}
