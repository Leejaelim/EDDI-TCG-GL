import * as THREE from 'three';
import { TextureManager } from "../../src/texture_manager/TextureManager";
import { NonBackgroundImage } from "../../src/shape/image/NonBackgroundImage";
import { AudioController } from "../../src/audio/AudioController";
import myCardMusic from '@resource/music/my_card/my-card.mp3';
import { MouseController } from "../../src/mouse/MouseController";
import { Component } from "../../src/router/Component";
import { TransparentRectangle } from "../../src/shape/TransparentRectangle";


export class TCGJustTestMyCardScreenView implements Component{
    private static instance: TCGJustTestMyCardScreenView | null = null;

        private scene: THREE.Scene;
        private camera: THREE.OrthographicCamera;
        private renderer: THREE.WebGLRenderer;
        private textureManager: TextureManager;
        private myCardContainer: HTMLElement;
        private background: NonBackgroundImage | null = null;
        private transparentRectangles: TransparentRectangle[] = [];

        private audioController: AudioController;
        private mouseController: MouseController;


        private initialized = false;
        private isAnimating = false;


        constructor(myCardContainer: HTMLElement) {
                this.myCardContainer = myCardContainer;
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0xffffff);
                this.renderer = new THREE.WebGLRenderer();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.myCardContainer.appendChild(this.renderer.domElement);

                const aspect = window.innerWidth / window.innerHeight;
                const viewSize = window.innerHeight;
                this.camera = new THREE.OrthographicCamera(
                    -aspect * viewSize / 2, aspect * viewSize / 2,
                    viewSize / 2, -viewSize / 2,
                    0.1, 1000
                );
                this.camera.position.set(0, 0, 5);
                this.camera.lookAt(0, 0, 0);

                this.textureManager = TextureManager.getInstance();
                this.audioController = AudioController.getInstance();
                this.audioController.setMusic(myCardMusic);

                this.mouseController = new MouseController(this.camera, this.scene);
                window.addEventListener('click', () => this.initializeAudio(), { once: true });

            }


        public static getInstance(myCardContainer: HTMLElement): TCGJustTestMyCardScreenView {
                if (!TCGJustTestMyCardScreenView.instance) {
                    TCGJustTestMyCardScreenView.instance = new TCGJustTestMyCardScreenView(myCardContainer);
                }
                return TCGJustTestMyCardScreenView.instance;
            }


        private async initializeAudio(): Promise<void> {
                try {
                    await this.audioController.playMusic();
                } catch (error) {
                    console.error('Initial audio play failed:', error);
                }
            }

       public async initialize(): Promise<void> {
               if (this.initialized) {
                   console.log('Already initialized');
                   this.show();
                   return;
               }

               console.log('TCGJustTestMyCardScreenView initialize() operate!!!');
               await this.textureManager.preloadTextures("image-paths.json");

               console.log("Textures preloaded. Adding background and buttons...");

               await this.addBackground();
               this.addTransparentRectangles();

               this.initialized = true;
               this.isAnimating = true;

               this.animate();
           }

       public show(): void {
               console.log('Showing TCGJustTestMyCardScreenView...');
               this.renderer.domElement.style.display = 'block';
               this.myCardContainer.style.display = 'block';
               this.isAnimating = true;

               this.scene.children.forEach(child => {
                   child.visible = true;
               });

               if (!this.initialized) {
                   this.initialize();
               } else {
                   this.animate();
               }
           }

       public hide(): void {
               console.log('Hiding TCGJustTestMyCardScreenView...');
               this.isAnimating = false;
               this.renderer.domElement.style.display = 'none';
               this.myCardContainer.style.display = 'none';
           }

       private async addBackground(): Promise<void> {
           const texture = await this.textureManager.getTexture('my_card_background', 1);
           console.log('addBackground():', texture);
           if (texture) {
               if (!this.background) {
                   this.background = new NonBackgroundImage(
                       window.innerWidth,
                       window.innerHeight,
                       new THREE.Vector2(0, 0)
                   );
               }
               this.background.createNonBackgroundImageWithTexture(texture, 1, 1);
               this.background.draw(this.scene);
               } else {
                   console.error("My Card Background texture not found.");
               }
           }

       private addTransparentRectangles(): void {
           // 나의 덱 버튼
           const myDeckButtonX = 0.05761;
           const myDeckButtonY = 0.04834;
           const myDeckWidth = 0.09415;
           const myDeckHeight = 0.05658;
           this.addTransparentRectangle('myDeckButton', myDeckButtonX, myDeckButtonY, myDeckWidth, myDeckHeight);

           // 로비 버튼
           const lobbyButtonX = 0.15761;
           const lobbyButtonY = 0.04834;
           const lobbyWidth = 0.08415;
           const lobbyHeight = 0.05658;
           this.addTransparentRectangle('lobbyButton', lobbyButtonX, lobbyButtonY, lobbyWidth, lobbyHeight);

           console.log('Add Transparent Button!');

           }

       private addTransparentRectangle(id: string, positionXPercent: number, positionYPercent: number, buttonWidth:number, buttonHeight:number): void {
           const screenWidth = window.innerWidth;
           const screenHeight = window.innerHeight;

           const positionX = (positionXPercent - 0.5) * screenWidth
           const positionY = (0.5 - positionYPercent) * screenHeight

           console.log('TransparentRectangle Position:', positionX, positionY);

           const position = new THREE.Vector2(
               positionX, positionY
           );

           const width = buttonWidth * screenWidth
           const height = buttonHeight * screenHeight
           console.log('Calculated position:', position, 'Width:', width, 'Height:', height);

           const transparentRectangle = new TransparentRectangle(position, width, height, 0xffffff, 0.5, id);
           transparentRectangle.addToScene(this.scene);
           this.transparentRectangles.push(transparentRectangle);
           }


       public animate(): void {
           if (this.isAnimating) {
               requestAnimationFrame(() => this.animate());
               this.renderer.render(this.scene, this.camera);
           } else {
               console.log('TCGJustTestMyCardScreenView: Animation stopped.');
           }
       }
   }


const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

const myCardView = TCGJustTestMyCardScreenView.getInstance(rootElement);
myCardView.initialize();
