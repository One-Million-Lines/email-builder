# Email block previews

80 previews based on the supplied Basic, Menu, Header, Content, Feature, Call to Action, Ecommerce, Transactional, Social and Footer screenshots.

- `png/`: ready-to-use 300 × 100 px grayscale images.
- `svg/`: matching editable vector images, with intrinsic width 300 px.
- `manifest.json`: block labels, identifiers and relative asset paths.
- `contact-sheet.png`: labeled review sheet; labels are outside the previews.
- `content-contact-sheet.png`: Content-only review sheet.
- `feature-contact-sheet.png`: Feature-only review sheet.
- `call-to-action-contact-sheet.png`: Call to Action review sheet.
- `ecommerce-contact-sheet.png`: Ecommerce review sheet.
- `transactional-contact-sheet.png`: Transactional review sheet.
- `social-contact-sheet.png`: Social review sheet.
- `footer-contact-sheet.png`: Footer review sheet.
- `social-icons/`: Bootstrap Icons v1.11.3 sources and MIT license.
- `generate.py`: deterministic source; run using Python with Pillow.

All individual previews contain only flat grayscale shapes, without text, gradients, shadows or effects. Text is represented by bars. Background is #f7f7f7. The builder uses its original text links; no runtime social icon assets are installed. Social preview generation also requires rsvg-convert.
