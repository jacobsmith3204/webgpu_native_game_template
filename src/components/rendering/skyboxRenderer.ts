import { invertMat4, multiplyMat4 } from "@engine_core/math";
import { Renderer, type RenderableObject, RenderCamera, GPUShaderStage } from "@engine_core/renderer";

export const skyboxMaterial = {
    bindingGroupLayout: {
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform", }
            }, {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            }, {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            }
        ]
    },
    pipeline: {
        label: "shader pipeline",
        layout: "auto",
        vertex: {
            entryPoint: "vs",
            buffers: [{
                arrayStride: 12, // total byte width of attributes
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: "float32x3"
                },
                ]
            }]
        },
        fragment: {
            entryPoint: "fs",
            targets: [{
                format: "bgra8unorm", // or whatever you're using
                blend: {
                    color: {
                        srcFactor: "one",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add",
                    },
                    alpha: {
                        srcFactor: "one",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add",
                    },
                },
            }],
        }, depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: false,
            depthCompare: 'less-equal',
        },
        primitive: {
            topology: "triangle-list",
            cullMode: "none",
        }
    }
};

export const SkyboxRenderer: Partial<RenderableObject> = {
    // x, y, u, v 
    material: skyboxMaterial,
    handlePass: HandlePass,
    init() {
        InitRenderer(this);

    },
}


function InitRenderer(obj: Partial<RenderableObject>) {
    const gpu = Renderer.device;

    const texture = obj.texture;
    const buffer = obj.cameraMatrixBuffer;
    if (!texture)
        throw new Error("no texture set");
    if (!buffer)
        throw new Error("no cameraMatrixBuffer set uniformBuffer(3 * 64)");

    // DEFINES THE RENDER PIPELINE
    const bindGroupLayout = gpu.createBindGroupLayout(obj.material.bindingGroupLayout);
    const pipelineLayout = gpu.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
    const pipeline = Object.murge({
        layout: pipelineLayout,
        vertex: { module: obj.shaderModule },
        fragment: {
            targets: [{ format: Renderer.surfaceFormat }],
            module: obj.shaderModule
        }
    }, obj.material.pipeline);
    const renderPipeline = gpu.createRenderPipeline(pipeline);
    //  BINDING IT ALL TOGETHER 

    const bindGroup = gpu.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer } },
            { binding: 1, resource: texture.view },
            {
                binding: 2, resource: gpu.createSampler({
                    magFilter: "linear",
                    minFilter: "linear",
                    mipmapFilter: "linear",
                    addressModeU: "repeat",
                    addressModeV: "clamp-to-edge",
                })
            }, // default sampler (uses nearest neighbor)

        ]
    });

    return [renderPipeline, bindGroup];
}


function HandlePass(this: RenderableObject, pass: GPURenderPassEncoder, gpu: GPUDevice, camera: RenderCamera) {
    // writes a single instance of the object to the buffer 
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);


    const ViewMatrix = multiplyMat4(camera.PerspectiveMatrix(), stripTranslation(camera.ViewMatrix()))

    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(invertMat4(ViewMatrix)));


    pass.setBindGroup(0, this.bindGroup); // attaches the texture (bindGroup) to the pass so i can draw it 
    pass.draw(this.vertexCount); // 6 vertices with 5 values per vertex(x,y,z,u,v)
}


function stripTranslation(m: Matrix) {
    m[12] = m[13] = m[14] = 0;
    return m;
}