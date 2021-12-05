export class SupportSceneObject
{
    group: THREE.Group;

    isPreview: boolean;
    
    constructor(support : THREE.Group, isPreview: boolean = false) {
        this.group = support;
        this.isPreview = isPreview;
    }

    setPrerenderMode() {
        const children = this.group.children;

        for (let index in children)
        {
            children[index].visible = false;
        }

        children[0].visible = true;
    }
    setFullRenderMode() {
        const children = this.group.children;

        for (let index in children)
        {
            children[index].visible = true;
        }
    }
}