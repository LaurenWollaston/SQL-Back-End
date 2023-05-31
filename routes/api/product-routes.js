const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_name'],
        },
        {
          model: Tag,
          through: {
            model: ProductTag,
            attributes: [] // Exclude join table attributes
          },
          attributes: ['tag_name'],
          as: 'tags'
        },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});



// get one product
router.get('/:id', async (req, res) => {
  try {
    var { id } = req.params;
    const products = await Product.findAll({
      where: { id },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_name'],
        },
        {
          model: Tag,
          through: {
            model: ProductTag,
            attributes: [] // Exclude join table attributes
          },
          attributes: ['tag_name'],
          as: 'tags'
        },
      ],
    });;
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// Create a Product route. 
//Post request paramaters:
// {
// 	"product_name": STRING,
//   "price": DECIMAL,
//   "stock": INTEGER,
// 	"category_id": INTEGER,
//   "tagIds": [INTEGER,]
// }

router.post('/', async (req, res) => {
  try {
    var { product_name, price, stock, category_id, tagIds } = req.body;
    const existingProduct = await Product.findOne({ where: { product_name } });
    if (existingProduct) {
      res.status(400).json({ message: 'Product already exists in the database.' });
      return;
    }
    if (price < 0){
      res.status(400).json({message: 'Price cannot be negative.'});
      return;
    }
    if (!category_id){
      res.status(400).json({message: 'Product has to have a category.'});
      return;
    }
    const newProduct = await Product.create({ product_name, price, stock, category_id});
    if (tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      const addTags = await ProductTag.bulkCreate(productTagIdArr);
    }
    res.redirect('/api/products/')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error'});
  }
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await ProductTag.destroy({ where: { product_id: id } });
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
