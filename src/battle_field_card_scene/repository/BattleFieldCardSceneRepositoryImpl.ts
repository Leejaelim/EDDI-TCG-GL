import {BattleFieldCardScene} from "../entity/BattleFieldCardScene";
import {BattleFieldCardSceneRepository} from "./BattleFieldCardSceneRepository";
import {MeshGenerator} from "../../mesh/generator";

import {TextureManager} from "../../texture_manager/TextureManager";
import {getCardById} from "../../card/utility";
import {Vector2d} from "../../common/math/Vector2d";

export class BattleFieldCardSceneRepositoryImpl implements BattleFieldCardSceneRepository {
    private static instance: BattleFieldCardSceneRepositoryImpl;
    private cardSceneMap: Map<number, BattleFieldCardScene> = new Map();

    private readonly CARD_WIDTH: number = 0.06493506493
    private readonly CARD_HEIGHT: number = this.CARD_WIDTH * 1.615

    private constructor() {}

    public static getInstance(): BattleFieldCardSceneRepositoryImpl {
        if (!BattleFieldCardSceneRepositoryImpl.instance) {
            BattleFieldCardSceneRepositoryImpl.instance = new BattleFieldCardSceneRepositoryImpl();
        }
        return BattleFieldCardSceneRepositoryImpl.instance;
    }

    async create(cardId: number, position: Vector2d): Promise<BattleFieldCardScene> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const textureManager = TextureManager.getInstance();
        const cardTexture = await textureManager.getTexture('card', card.카드번호);
        if (!cardTexture) {
            throw new Error(`Texture for card ${cardId} not found`);
        }

        const cardWidth = this.CARD_WIDTH * window.innerWidth;
        const cardHeight = this.CARD_HEIGHT;

        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);

        const newCardScene = new BattleFieldCardScene(mainCardMesh);
        this.cardSceneMap.set(cardId, newCardScene);

        return newCardScene;
    }

    findById(id: number): BattleFieldCardScene | undefined {
        return this.cardSceneMap.get(id);
    }

    findAll(): BattleFieldCardScene[] {
        return Array.from(this.cardSceneMap.values());
    }

    deleteById(id: number): boolean {
        return this.cardSceneMap.delete(id);
    }

    deleteAll(): void {
        this.cardSceneMap.clear();
    }
}