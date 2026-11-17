from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import subprocess
import io

ROOT = Path(__file__).resolve().parent
BG, LIGHT, MID, DARK = '#f7f7f7', '#dedede', '#bcbcbc', '#929292'
items = []
class Preview:
    def __init__(self, category, slug, label):
        self.category, self.slug, self.label = category, slug, label
        self.im = Image.new('RGB', (300,100), BG)
        self.d = ImageDraw.Draw(self.im)
        self.svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><rect width="300" height="100" fill="{BG}"/>']
    def rect(self,x,y,w,h,c=MID):
        self.d.rectangle((x,y,x+w-1,y+h-1),fill=c)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>')
    def poly(self,pts,c=DARK):
        self.d.polygon(pts,fill=c)
        self.svg.append(f'<polygon points="{" ".join(f"{x},{y}" for x,y in pts)}" fill="{c}"/>')
    def circle(self,x,y,r,c=MID):
        self.d.ellipse((x-r,y-r,x+r-1,y+r-1),fill=c)
        self.svg.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>')
    def line(self,x,y,w,h=4,c=MID): self.rect(x,y,w,h,c)
    def picture(self,x,y,w,h):
        self.rect(x,y,w,h,LIGHT)
        self.circle(x+w*.76,y+h*.28, max(3,int(h*.09)),MID)
        self.poly([(x+w*.12,y+h*.83),(x+w*.36,y+h*.38),(x+w*.55,y+h*.67),(x+w*.68,y+h*.5),(x+w*.9,y+h*.83)],MID)
    def logo(self,x,y,w=64,h=26):
        self.rect(x,y,w,h,LIGHT)
        cx,cy=x+w/2,y+h/2
        self.poly([(cx,cy-8),(cx+8,cy),(cx,cy+8),(cx-8,cy)],DARK)
    def save(self):
        for ext in ('svg','png'): (ROOT/ext/self.category).mkdir(parents=True,exist_ok=True)
        (ROOT/'svg'/self.category/f'{self.slug}.svg').write_text(''.join(self.svg)+'</svg>\n')
        self.im.save(ROOT/'png'/self.category/f'{self.slug}.png')
        items.append({'category':self.category,'id':self.slug,'label':self.label,'width':300,'height':100,'png':f'png/{self.category}/{self.slug}.png','svg':f'svg/{self.category}/{self.slug}.svg'})

def make(cat,slug,label,fn):
    p=Preview(cat,slug,label);fn(p);p.save()
make('basic','text-block','Text Block',lambda p:[p.line(30,26,240),p.line(30,38,228),p.line(30,50,240),p.line(30,62,172)])
make('basic','heading','Heading',lambda p:p.line(30,43,222,12,DARK))
make('basic','image','Image',lambda p:p.picture(30,12,240,76))
make('basic','image-with-caption','Image with Caption',lambda p:[p.picture(30,10,240,60),p.line(82,80,136)])
def spacer(p):
    p.line(30,20,240,2,LIGHT);p.line(30,78,240,2,LIGHT)
    p.rect(149,33,2,34,MID)
    p.poly([(150,27),(144,35),(156,35)],MID);p.poly([(150,73),(144,65),(156,65)],MID)
make('basic','spacer','Spacer',spacer)
make('basic','divider','Divider',lambda p:p.line(30,49,240,2,DARK))
def nav(p):
    for x,w in [(30,35),(78,48),(139,38),(190,30),(233,37)]:p.line(x,47,w,6,DARK)
make('menu','horizontal-nav','Horizontal Nav',nav)
def tabs(p):
    for x in (30,92,154,216):
        p.rect(x,33,54,34,LIGHT);p.line(x+9,47,36,5,DARK)
    p.line(30,65,54,3,DARK)
make('menu','section-tabs','Section Tabs',tabs)
def issue(p):
    p.line(30,14,83,7,DARK)
    for y,w in [(33,184),(48,155),(63,195),(78,139)]:
        p.rect(31,y+1,5,5,DARK);p.line(46,y,w)
make('menu','in-this-issue','In This Issue',issue)
def actions(p):
    for x,w in [(47,48),(119,42),(185,68)]:
        p.line(x,44,w,5,DARK);p.line(x,53,w,1,DARK)
    p.circle(107,48,2);p.circle(173,48,2)
make('menu','linked-action-strip','Linked Action Strip',actions)
make('header','logo-centered','Logo Centered',lambda p:p.logo(110,34,80,32))
make('header','logo-left-date-right','Logo Left + Date Right',lambda p:[p.logo(30,35,74,30),p.line(194,47,76,5)])
make('header','publication-masthead','Publication Masthead',lambda p:[p.line(59,32,182,16,DARK),p.line(87,61,126,4),p.line(30,82,240,1,LIGHT)])
make('header','hero-headline-image','Hero with Headline & Image',lambda p:[p.line(64,10,172,9,DARK),p.line(98,27,104,3),p.picture(30,40,240,52)])
make('header','hero-text-only','Hero Text Only',lambda p:[p.line(112,16,76,4),p.line(48,33,204,11,DARK),p.line(89,50,122,11,DARK),p.line(61,77,178,4)])
make('header','announcement-bar','Announcement Bar',lambda p:[p.rect(18,33,264,34,DARK),p.line(64,47,172,5,LIGHT)])
make('header','logo-view-in-browser','Logo + View in Browser',lambda p:[p.line(211,17,59,3),p.line(211,23,59,1),p.logo(110,40,80,32)])
def welcome(p):
    # Flat greeting symbol beside a two-line welcome layout.
    p.poly([(42,61),(33,49),(36,46),(42,51),(37,35),(41,33),(46,46),(43,29),(47,28),(51,45),(51,30),(55,30),(57,47),(61,37),(65,39),(62,57),(55,65)],MID)
    p.line(79,37,181,11,DARK);p.line(79,57,151,4);p.line(90,79,120,3,LIGHT)
make('header','welcome-header','Welcome Header',welcome)
make('header','logo-tagline','Logo + Tagline',lambda p:[p.logo(114,20,72,29),p.line(72,65,156,4)])
make('header','story-label-header','Story Label Header',lambda p:[p.line(106,23,88,5),p.line(32,43,236,11,DARK),p.line(76,62,148,11,DARK)])
# Content previews, in screenshot order. All text is represented by bars.
make('content','headline-body','Headline + Body',lambda p:[p.line(30,25,181,10,DARK),p.line(30,48,240),p.line(30,60,222),p.line(30,72,165)])
make('content','lead-story','Lead Story',lambda p:[p.line(30,7,58,3),p.line(30,17,211,7,DARK),p.line(30,29,89,3),p.picture(30,40,240,34),p.line(30,80,230,3),p.line(30,89,69,4,DARK)])
make('content','article-card','Article Card',lambda p:[p.picture(30,8,240,43),p.line(30,57,52,3),p.line(30,66,213,7,DARK),p.line(30,79,231,3),p.line(30,89,57,4,DARK)])
make('content','image-text','Image + Text',lambda p:[p.picture(30,10,240,48),p.line(30,67,145,8,DARK),p.line(30,83,232,4)])
def two_stories(p):
    p.line(30,6,82,3)
    for y in (16,57):
        p.picture(98,y,104,22);p.line(30,y+26,122,5,DARK);p.line(30,y+34,180,3)
make('content','two-stories','Two Stories',two_stories)
def three_picks(p):
    p.line(30,9,76,3)
    for y,w in [(23,190),(48,176),(73,201)]:
        p.rect(30,y,8,7,DARK);p.line(46,y,w,7,DARK);p.line(30,y+13,217,3)
        if y<73:p.line(30,y+21,240,1,LIGHT)
make('content','three-picks','Three Picks',three_picks)
def quote(p):
    # Geometric opening quotation marks, not font glyphs.
    for x in (31,42):
        p.rect(x,26,7,8,DARK);p.poly([(x,34),(x+7,34),(x+2,41),(x-2,41)],DARK)
    p.line(62,29,205,8,DARK);p.line(85,44,159,8,DARK);p.line(112,69,76,4)
make('content','pull-quote','Pull Quote',quote)
def byline(p):
    p.circle(150,30,20,LIGHT);p.circle(150,25,6,MID)
    p.rect(140,35,20,7,MID);p.line(114,61,72,7,DARK);p.line(99,77,102,4)
make('content','byline','Byline',byline)
make('content','editors-note',"Editor's Note",lambda p:[p.line(30,14,73,4,DARK),p.line(30,32,240),p.line(30,43,229),p.line(30,54,194),p.line(30,69,172),p.line(30,85,45,4,DARK)])
def tip(p):
    p.rect(20,15,260,70,LIGHT)
    p.circle(41,33,7,DARK);p.rect(38,39,6,5,DARK);p.line(57,29,66,6,DARK)
    p.line(36,53,226,4);p.line(36,65,177,4)
make('content','tip-box','Tip Box',tip)
def numbered(p):
    p.line(30,8,144,7,DARK)
    for y,w in [(25,137),(43,164),(61,184),(79,109)]:
        # Compact square markers stand in for numbers, keeping the asset text free.
        p.rect(30,y,7,7,DARK);p.line(45,y,w,5,DARK);p.line(45,y+9,193,3)
make('content','numbered-list','Numbered List',numbered)
def bullets(p):
    p.line(30,14,139,8,DARK)
    for y,w in [(36,196),(51,177),(66,218),(81,185)]:
        p.circle(33,y+2,2,DARK);p.line(45,y,w,4)
make('content','bullets','Bullets',bullets)
make('content','q-and-a','Q&A',lambda p:[p.line(30,13,85,4),p.line(30,28,215,8,DARK),p.line(30,50,240),p.line(30,62,227),p.line(30,74,166)])
def stats(p):
    p.line(106,12,88,4)
    for x,w in [(113,15),(134,19),(159,12),(177,10)]:p.rect(x,29,w,19,DARK)
    p.line(93,59,114,4);p.line(30,72,240,1,LIGHT)
    for x,w in [(72,36),(124,37),(177,51)]:p.line(x,83,w,4)
make('content','stat-row','Stat Row',stats)
def timeline(p):
    p.line(30,9,75,3)
    for y,w in [(25,154),(49,188),(73,143)]:
        p.line(30,y,24,6,DARK);p.circle(62,y+3,2,MID);p.line(72,y,w,6,DARK);p.line(30,y+12,185,3)
make('content','timeline','Timeline',timeline)
def podcast(p):
    p.rect(128,6,44,44,LIGHT)
    # Equalizer mark on square cover.
    for x,h in [(136,8),(142,18),(148,28),(154,18),(160,10)]:p.rect(x,28-h/2,4,h,DARK)
    p.line(123,56,54,3);p.line(62,66,176,6,DARK);p.line(110,77,80,3)
    p.rect(124,85,52,11,DARK);p.poly([(147,87),(147,94),(153,90)],LIGHT)
make('content','podcast-episode','Podcast Episode',podcast)
def video(p):
    p.picture(30,8,240,54);p.circle(150,35,13,BG);p.poly([(146,27),(146,43),(158,35)],DARK)
    p.line(30,72,228,7,DARK);p.line(30,87,60,3)
make('content','video','Video',video)
def event(p):
    # Only the date panel is visible in the supplied Event reference.
    p.rect(20,16,260,68,DARK);p.line(133,29,34,4,LIGHT)
    p.rect(136,44,10,23,LIGHT);p.rect(153,44,14,23,LIGHT)
make('content','event','Event',event)
def code(p):
    p.rect(20,25,260,50,LIGHT)
    # Broken, indented bars convey monospace code without characters.
    for y,segments in [(38,[(34,20),(60,44),(110,69)]),(49,[(46,28),(80,57),(143,75)]),(60,[(34,20),(60,38),(104,93)])]:
        for x,w in segments:p.line(x,y,w,3,DARK)
make('content','code','Code',code)
# Feature previews, in screenshot order.
def feature_list(p):
    p.line(79,15,142,8,DARK)
    for y,w in [(37,112),(56,146),(75,168)]:
        x=(300-w-20)/2
        p.poly([(x,y+3),(x+4,y+7),(x+11,y-2),(x+14,y),(x+4,y+12),(x-2,y+6)],DARK)
        p.line(x+22,y+3,w,4)
make('feature','feature-list','Feature List',feature_list)
def three_features(p):
    # Three vertically stacked icon / title / description groups, matching the reference.
    for y in (6,37,68):
        if y==6:p.poly([(151,y),(143,y+9),(150,y+9),(147,y+16),(159,y+5),(152,y+5)],DARK)
        elif y==37:
            p.rect(143,y+3,14,11,MID);p.circle(150,y+2,3,MID);p.circle(158,y+8,3,MID)
        else:
            p.rect(143,y+4,15,10,MID);p.rect(149,y,2,4,DARK)
            p.circle(147,y+8,1,BG);p.circle(154,y+8,1,BG)
        p.line(120,y+19,60,5,DARK);p.line(89,y+27,122,3)
make('feature','three-features','Three Features',three_features)
make('feature','before-after','Before / After',lambda p:[p.line(30,7,43,3),p.picture(30,16,240,30),p.line(30,55,37,3),p.picture(30,64,240,30)])
make('feature','benefit-pair','Benefit Pair',lambda p:[p.picture(30,9,240,45),p.line(30,64,139,8,DARK),p.line(30,81,235,3),p.line(30,89,162,3)])
def testimonial(p):
    for x in (32,42):
        p.rect(x,13,6,7,DARK);p.poly([(x,20),(x+6,20),(x+1,26),(x-2,26)],DARK)
    p.line(61,16,203,6,DARK);p.line(102,29,96,6,DARK)
    p.circle(150,58,15,LIGHT);p.circle(150,54,5,MID);p.rect(143,62,14,5,MID)
    p.line(82,84,136,4)
make('feature','testimonial','Testimonial',testimonial)
def logo_strip(p):
    p.line(116,21,68,4)
    p.rect(30,40,240,37,LIGHT)
    p.poly([(60,48),(70,58),(60,68),(50,58)],DARK)
    p.circle(120,58,10,DARK);p.circle(120,58,5,LIGHT)
    p.poly([(180,48),(192,68),(168,68)],DARK)
    p.rect(229,48,7,20,DARK);p.rect(240,48,7,20,DARK)
make('feature','logo-strip','Logo Strip',logo_strip)
make('feature','gradient-hero-cta','Gradient Hero CTA',lambda p:[p.line(112,13,76,4),p.line(49,31,202,10,DARK),p.line(61,54,178,4),p.rect(116,72,68,18,DARK),p.line(129,79,42,3,LIGHT)])
# Call to Action previews, in screenshot order.
def button(p,x=116,y=65,w=68,h=20):
    p.rect(x,y,w,h,DARK);p.line(x+w*.22,y+h/2-1,w*.56,3,LIGHT)
make('call-to-action','simple-cta','Simple CTA',lambda p:[p.line(70,18,160,9,DARK),p.line(96,42,108,4),button(p)])
make('call-to-action','cta-banner','CTA Banner',lambda p:[p.rect(20,10,260,80,DARK),p.line(112,25,76,4,LIGHT),p.line(57,42,186,10,LIGHT),p.line(115,72,70,5,LIGHT)])
make('call-to-action','button','Button',lambda p:button(p,110,36,80,28))
make('call-to-action','two-buttons','Two Buttons',lambda p:[p.line(94,12,112,8,DARK),p.line(92,32,116,4),button(p,112,48,76,20),p.line(124,83,52,4,DARK)])
make('call-to-action','image-cta','Image CTA',lambda p:[p.picture(30,7,240,40),p.line(63,56,174,7,DARK),p.line(103,71,94,3),button(p,121,82,58,13)])
make('call-to-action','subscribe','Subscribe',lambda p:[p.rect(20,10,260,80,LIGHT),p.line(103,24,94,4,DARK),p.line(56,40,188,8,DARK),button(p,107,63,86,20)])
make('call-to-action','referral','Referral',lambda p:[p.line(113,8,74,3),p.line(88,22,124,8,DARK),p.line(67,42,166,3),p.line(104,57,92,4,DARK),p.line(104,63,92,1,DARK),button(p,115,75,70,18)])
make('call-to-action','upgrade','Upgrade',lambda p:[p.rect(20,8,260,84,LIGHT),p.line(107,20,86,3,DARK),p.line(105,35,90,13,DARK),p.line(66,59,168,3),button(p,118,72,64,15)])
make('call-to-action','feedback','Feedback',lambda p:[p.line(37,41,226,5,DARK),p.line(81,54,138,5,DARK)])
# Ecommerce previews, in screenshot order.
def prices(p,x,y):
    p.line(x,y,22,3);p.line(x-1,y+1,24,1,DARK);p.line(x+30,y-1,29,5,DARK)
def product_grid(p):
    for x in (30,156):
        p.picture(x,8,114,48);p.line(x+4,63,74,5,DARK)
        prices(p,x+4,76);button(p,x+29,86,56,11)
make('ecommerce','product-grid','Product Grid',product_grid)
make('ecommerce','collection','Collection',lambda p:[p.picture(30,7,240,43),p.line(81,59,138,7,DARK),p.line(100,74,100,3),button(p,103,84,94,12)])
def voucher(p):
    p.line(122,15,56,4)
    for x in (99,117,135,153,171,189):p.rect(x,34,12,15,DARK)
    button(p,117,68,66,20)
make('ecommerce','voucher-code','Voucher Code',voucher)
def flash_sale(p):
    p.rect(20,8,260,84,DARK)
    p.circle(88,26,6,LIGHT);p.circle(88,26,4,DARK)
    p.rect(88,22,1,5,LIGHT);p.rect(88,26,3,1,LIGHT)
    p.line(100,24,109,4,LIGHT);p.line(54,42,192,10,LIGHT)
    p.rect(115,66,70,19,LIGHT);p.line(131,74,38,3,DARK)
make('ecommerce','flash-sale','Flash Sale',flash_sale)
def abandoned(p):
    # The reference is cropped after the price; do not invent a hidden button.
    p.line(68,8,164,7,DARK);p.line(107,24,86,3)
    p.picture(30,36,240,43);p.line(30,85,104,5,DARK);prices(p,30,95)
make('ecommerce','abandoned-cart','Abandoned Cart',abandoned)
def review(p):
    from math import sin,cos,pi
    p.line(97,17,106,9,DARK);p.line(87,41,126,4)
    for x in (98,124,150,176,202):
        def star(r1,r2):
            return [(x+cos(-pi/2+i*pi/5)*(r1 if i%2==0 else r2),72+sin(-pi/2+i*pi/5)*(r1 if i%2==0 else r2)) for i in range(10)]
        p.poly(star(10,4.5),DARK);p.poly(star(6,2.7),BG)
make('ecommerce','review','Review',review)
def gift_pick(p):
    p.line(30,6,90,3);p.picture(30,16,240,38)
    p.line(30,61,106,5,DARK);prices(p,30,73)
    p.line(30,83,207,3);button(p,120,90,60,10)
make('ecommerce','gift-pick','Gift Pick',gift_pick)
# Transactional previews, in screenshot order.
make('transactional','appointment','Appointment',lambda p:[p.line(119,9,62,3),p.line(72,23,156,8,DARK),p.line(95,43,110,5,DARK),p.line(88,59,124,3),button(p,105,76,90,17)])
make('transactional','verify-email','Verify Email',lambda p:[p.line(103,19,94,9,DARK),p.line(62,44,176,4),button(p,112,65,76,22)])
make('transactional','password-reset','Password Reset',lambda p:[p.line(83,12,134,8,DARK),p.line(39,33,222,3),button(p,104,48,92,19),p.line(75,78,150,3),p.line(107,89,86,3,DARK)])
def invoice(p):
    p.line(30,7,84,3);p.line(30,18,130,7,DARK);p.line(30,33,164,3)
    p.line(30,43,240,1,LIGHT)
    p.line(30,51,105,4);p.line(30,61,132,4)
    p.line(30,70,240,1,LIGHT);p.line(30,77,94,5,DARK)
    button(p,95,88,110,12)
make('transactional','invoice','Invoice',invoice)
def shipping(p):
    # Flat front view of a parcel; no perspective or shading.
    p.rect(139,7,22,18,LIGHT);p.rect(148,7,4,8,DARK);p.rect(143,18,7,3,MID)
    p.line(68,36,164,8,DARK);p.line(78,56,144,3)
    for x,w in [(104,28),(139,26),(172,24)]:p.line(x,68,w,3)
    button(p,108,81,84,17)
make('transactional','shipping-update','Shipping Update',shipping)
def order_summary(p):
    p.line(30,7,65,3);p.line(30,18,157,7,DARK);p.line(30,33,147,3)
    p.line(30,43,240,1,LIGHT)
    p.line(30,51,151,4);p.line(30,61,138,4)
    p.line(30,71,240,1,LIGHT)
    p.line(30,78,99,3);p.line(30,86,88,3);p.line(30,94,91,5,DARK)
make('transactional','order-summary','Order Summary',order_summary)
# Social previews use the original Bootstrap Icons paths, not drawn substitutes.
def social_icon(p,name,x,y,size=18):
    source=(ROOT/'social-icons'/f'{name}.svg').read_text()
    root=source[source.index('<svg'):]
    inner=root[root.index('>')+1:root.rindex('</svg>')]
    fragment=f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 16 16" fill="{DARK}">{inner}</svg>'
    raster=subprocess.run(['rsvg-convert'],input=fragment.encode(),capture_output=True,check=True).stdout
    icon=Image.open(io.BytesIO(raster)).convert('RGBA');p.im.paste(icon,(x,y),icon)
    p.svg.append(f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="0 0 16 16" fill="{DARK}">{inner}</svg>')
def social_post(p):
    p.line(30,7,94,3);p.circle(150,29,12,LIGHT);p.circle(150,26,4,MID);p.rect(144,33,12,4,MID)
    p.line(30,47,67,3);p.line(30,59,239,4);p.line(30,70,218,4)
    social_icon(p,'twitter',30,82,12);p.line(49,86,66,3,DARK)
make('social','social-post','Social Post',social_post)
make('social','share-bar','Share Bar',lambda p:[p.line(103,23,94,5,DARK),social_icon(p,'envelope-fill',103,55,18),social_icon(p,'twitter',141,55,18),social_icon(p,'facebook',179,55,18)])
make('social','social-icons','Social Icons',lambda p:[p.line(123,23,54,4),*[social_icon(p,n,x,53,20) for n,x in [('twitter',80),('instagram',120),('linkedin',160),('youtube',200)]]])
def ig_grid(p):
    p.line(99,5,102,3)
    for y in (15,39,63):p.picture(135,y,30,21)
    p.line(123,92,54,3,DARK)
make('social','ig-grid','IG Grid',ig_grid)
def community(p):
    p.line(94,22,112,4)
    for n,x in [('twitter',51),('instagram',124),('youtube',197)]:
        social_icon(p,n,x,55,18);p.line(x+25,61,27,6,DARK)
make('social','community-stats','Community Stats',community)
# Footer previews, in screenshot order. Labels stay outside each asset.
def footer_links(p,segments,y):
    for x,w in segments:
        p.line(x,y,w,3,DARK);p.line(x,y+5,w,1,DARK)
def simple_footer(p):
    p.line(30,23,240,3);p.line(119,33,62,3)
    p.line(100,55,100,3)
    footer_links(p,[(88,48),(145,23),(177,37)],77)
make('footer','simple-footer','Simple Footer',simple_footer)
def social_footer(p):
    p.line(126,13,48,5,DARK)
    # The supplied footer has a text-link row, represented by five bars.
    for x,w in [(43,32),(85,43),(138,36),(184,39),(233,24)]:p.line(x,34,w,4,DARK)
    p.line(30,52,240,1,LIGHT);p.line(107,66,86,3)
    footer_links(p,[(124,39)],84)
make('footer','social-footer','Social Footer',social_footer)
def publisher_footer(p):
    p.logo(124,7,52,20);p.line(111,35,78,6,DARK)
    p.line(94,50,112,3);p.line(30,62,240,1,LIGHT)
    p.line(81,74,138,3);footer_links(p,[(96,69),(175,34)],88)
make('footer','publisher-footer','Publisher Footer',publisher_footer)
def app_footer(p):
    p.line(121,12,58,6,DARK)
    for x in (82,156):
        p.rect(x,30,62,22,LIGHT);p.line(x+12,39,38,4,DARK)
    p.line(30,63,240,1,LIGHT);p.line(113,74,74,3)
    footer_links(p,[(130,40)],88)
make('footer','app-footer','App Footer',app_footer)
make('footer','address','Address',lambda p:[p.line(52,35,196,4),footer_links(p,[(128,44)],62)])
def preferences(p):
    p.line(94,18,112,5,DARK);footer_links(p,[(84,84),(179,40)],39)
    p.line(30,59,240,1,LIGHT);p.line(108,76,84,3)
make('footer','preferences','Preferences',preferences)
def signature(p):
    p.line(30,20,82,4,DARK);p.line(30,42,12,3,DARK);p.line(49,37,48,11,DARK)
    p.line(30,65,240,1,LIGHT);footer_links(p,[(30,44)],81)
make('footer','signature','Signature',signature)
(ROOT/'manifest.json').write_text(json.dumps(items,indent=2)+'\n')
# Labels are outside the assets, on the review sheet only.
sheet=Image.new('RGB',(1000,40+((len(items)+2)//3)*126),'white');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',13)
for i,item in enumerate(items):
    x=20+(i%3)*330;y=20+(i//3)*126
    sheet.paste(Image.open(ROOT/item['png']),(x,y))
    d.text((x,y+104),f"{item['category'].title()} / {item['label']}",fill='#555555',font=font)
sheet.save(ROOT/'contact-sheet.png')
for category in ('content','feature','call-to-action','ecommerce','transactional','social','footer'):
    subset = [item for item in items if item['category']==category]
    category_sheet=Image.new('RGB',(1000,40+((len(subset)+2)//3)*126),'white')
    cd=ImageDraw.Draw(category_sheet)
    for i,item in enumerate(subset):
        x=20+(i%3)*330; y=20+(i//3)*126
        category_sheet.paste(Image.open(ROOT/item['png']),(x,y))
        cd.text((x,y+104),item['label'],fill='#555555',font=font)
    category_sheet.save(ROOT/f'{category}-contact-sheet.png')
(ROOT/'README.md').write_text('''# Email block previews

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
''')
print(f'Created {len(items)} SVGs and {len(items)} PNGs in {ROOT}')
