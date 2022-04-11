import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const cuboId = await Cuboid.query().findById(req.params.id);
  if (cuboId) {
    cuboId.volume = cuboId.width * cuboId.height * cuboId.depth;
    return res.status(HttpStatus.OK).json(cuboId);
  }
  return res.sendStatus(HttpStatus.NOT_FOUND);
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId);

  if (!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const bagVolume = bag.volume;
  const newCubo = width * height * depth;
  // eslint-disable-next-line fp/no-let
  let totalVolume = 0;

  const cubos = await Cuboid.query().where({ bagId });
  cubos.forEach((cubo) => {
    totalVolume += cubo.height * cubo.width * cubo.depth;
  });
  totalVolume += newCubo;

  if (totalVolume > bagVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .send({ message: 'Insufficient capacity in bag' });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId);

  if (!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const bagVolume = bag.volume;
  const newCuboVolume = width * height * depth;
  // eslint-disable-next-line fp/no-let
  let totalVolume = 0;

  const cubos = await Cuboid.query().where({ bagId }).whereNot({ id });

  cubos.forEach((cubo) => {
    totalVolume += cubo.height * cubo.width * cubo.depth;
  });

  totalVolume += newCuboVolume;

  if (totalVolume > bagVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .send({ message: 'Insufficient capacity in bag' });
  }

  await Cuboid.query().update({ width, height, depth, bagId }).where({ id });

  return res
    .status(HttpStatus.OK)
    .json({ id, width, height, depth, bag: { id: bagId } });
};

export const deletecubo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const cubo = await Cuboid.query().findById(id);
  if (!cubo) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  await Cuboid.query().delete().where({ id });
  return res.sendStatus(HttpStatus.OK);
};
