const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: Product,
          through: {
            model: ProductTag,
            attributes: [] // Exclude join table attributes
          },
          attributes: ['id', 'product_name', 'stock', 'price'],
          as: 'products'
        },
      ],
    });

    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    var { id } = req.params;
    const tags = await Tag.findAll({
      where: { id },
      include: [
        {
          model: Product,
          through: {
            model: ProductTag,
            attributes: [] // Exclude join table attributes
          },
          attributes: ['id', 'product_name', 'stock', 'price'],
          as: 'products'
        },
      ],
    });
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    var { tag_name } = req.body;
    const existingTag = await Tag.findOne({ where: { tag_name } });
    if (existingTag) {
      res.status(400).json({ message: 'Tag already exists.' });
      return;
    }
    const newTag = await Tag.create({ tag_name });
    res.redirect('/api/tags/')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error'});
  }
});

router.put('/:id', async (req, res) => {
  // update a tag by its `id` value
  try {
    var { id } = req.params;
    var { tag_name } = req.body;
    const tag = await Tag.findOne({where: { id }});
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    };
    tag.tag_name = tag_name;
    await tag.save();
    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Server Error'});
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await ProductTag.destroy({ where: { tag_id: id } });
    await tag.destroy();
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
