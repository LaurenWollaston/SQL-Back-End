const router = require('express').Router();
const { Category, Product, Tag } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'product_name', 'stock', 'price'],
        },
      ],
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    var { id } = req.params;
    const categories = await Category.findAll({
      where: { id },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'product_name', 'stock', 'price'],
        },
      ],
    }
    );
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    var { category_name } = req.body;
    const existingCategory = await Category.findOne({ where: { category_name } });
    if (existingCategory) {
      res.status(400).json({ message: 'Category already exists.' });
      return;
    }
    const newCategory = await Category.create({ category_name });
    res.redirect('/api/categories/')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error'});
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    var { id } = req.params;
    var { category_name } = req.body;
    const category = await Category.findOne({where: { id }});
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    };
    category.category_name = category_name;
    await category.save();
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Server Error'});
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
