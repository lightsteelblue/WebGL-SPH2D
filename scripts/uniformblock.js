export const uniformBlockBindingTable = {
    // 同じUBOを頂点シェーダとフラグメントシェーダでそれぞれ使いたい場合があるので接尾辞'_'を付けて対処
    ParticleTexture: 0,
    CellTexture:     1, CellTexture_:    1,
    SubcellTexture:  2,
    ToIntPos:        3,
    ToFloatPos:      4,
    Cell:            5,
    Subcell:         6,
    SPHVertexShader: 7,
    Density:         8,
    Update:          9,
    MarchingSquares: 10,
};

Object.freeze(uniformBlockBindingTable);
