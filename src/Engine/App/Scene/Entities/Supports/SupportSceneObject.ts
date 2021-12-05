export class SupportSceneObject
{
    group: THREE.Group;
    
    constructor(support : THREE.Group) {
        this.group = support;
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