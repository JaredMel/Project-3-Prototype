export default class SampleScene extends Phaser.Scene {
    constructor() {
        super('sampleScene')
    }
 
    preload() {
        // Load assets
        this.load.path = './assets/'
        
    }
 
    init() {
        
    }
 
    create() {
        const { width, height } = this.scale
    }
}