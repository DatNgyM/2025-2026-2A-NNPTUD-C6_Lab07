let mongoose = require('mongoose');

let productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        price: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: ""
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref:'category',
            required: true
        },
        images: {
            type: [String],
            default: ["https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png"]
        },
        isDeleted:{
            type:Boolean,
            default:false
        }
    }, {
    timestamps: true
})

// Khi tạo mới product => tự tạo 1 inventory tương ứng.
productSchema.pre('save', function () {
    // Mongoose có thể không truyền callback `next` ở một số chế độ.
    // Dùng signature không tham số để tránh lỗi "next is not a function".
    this._wasNew = this.isNew;
});

productSchema.post('save', async function (doc) {
    if (!this._wasNew) return;
    const inventoryModel = require('./inventories');
    try {
        // Upsert để đảm bảo 1 product chỉ có 1 inventory
        await inventoryModel.findOneAndUpdate(
            { product: doc._id },
            {
                $setOnInsert: {
                    stock: 0,
                    reserved: 0,
                    soldCount: 0,
                },
            },
            { upsert: true, new: true }
        );
    } catch (err) {
        // Không crash luồng tạo product nếu inventory bị lỗi
        console.error('Create inventory failed:', err.message);
    }
});

module.exports = mongoose.model('product', productSchema)