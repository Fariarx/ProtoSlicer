export const LinearGenerator = (()=>{
    let linearGenerator: number = 0;

    return function () {
        linearGenerator++;

        return linearGenerator;
    }
})();
