import ReactMarkdown from 'react-markdown';

import { Modal } from 'components/Modal';

import s from './s.module.css';

const mockMarkdown = `
# Tumulo quae genitor

## Quarto et vestes Proteus ecce auxilium collo

Lorem markdownum cruore: pariter male moly, meruit nec vocato ille corpus deum
letum mane gurgite potest. Illo ante nihil erat **male deflent** iam missus
aliud attonitus habet illis. Pater de pontus celebres.

1. Pereat expulit
2. Porrigis torrentem orbis deceptus illic in et
3. Deae excidit iam et simul non laniatque
4. Geniti verboque putatur
5. Et aut est ventis et putas nec

Venata daedalus *velit*. Telum circumdare valuit; ipse mare!

1. Pudet saxi constitit
2. Laeta tibi ut dominis induitur viscera
3. Fieres nata accensus
4. Modo manus sonanti

## Tabellis ferar fuerunt voluit cruoris tulerat

**Finitque** crimen. Illa inde Inachus nunc sustulit saepe: mons oculos si erat
campos: urbes. Quid uterque ipsis comitata et doloris corpus saepius caelestia
draconem [laboriferi](http://trepidante-pulvere.com/): aratra?

    if (internet <= dram.recursive_clean_spam.dial_kde(refreshCyberspaceJpeg,
            syntax_disk_nic, 33)) {
        digital = internal;
        doubleLampBsod = alphaSnowTft;
        minimize_blog_compression += teraflops.zeroFacebookUnfriend(
                name_friendly, 91, srgb_white);
    } else {
        rwWiOsi(header_asp.publishing_window_virtual(adf_frequency,
                mamp_balancing_sprite), tiger_networking, 53);
    }
    rdfMac = outboxBasebandProcess(memoryTypeface, gateway_sidebar_deprecated);
    link_queue_drive += 1;
    raw += batchFddi.wordart(throughputFlatbed(balance, del), wormD + wais, 16)
            + permalink_impact + property_vaporware;

Est pronus terras, ferrem vis **summas temporis saevitiam** unius, scelus
seductaque illis, tene suis habent ferendae et. Ultor hic defensus removebitur
ceratis tectum patientia successit male tuus illi sua defuit placebant. Fatendo
Taenaria in *sentit*, gelido ipse languore aestibus parte, in? Deficit paelex
luet cesserunt **causa**, prunam **responsura ligatis linguae** super corpus
maenades mansit!

- Et lactantes populi inpia resolutaque mollibat aliisque
- Redditus forsitan latos genitore frontem
- Urgetque respiciens calculus
- Transit geruntur temerasse dextera haec
- Publica inter
- Derexit gravi similis praesentis potuit mittunt valet

Serpens unus telorum telum. Leti saeva dura aquilam, et dubitat edidit nymphae,
obstitit natumque nate Cephalus spectat tremit tabellas accipe. Qui Hector
frustraque in factum fecit vulnere nisi. Sunt parvas anni herba Italico orbem
mortis, spatiis vires, et?
`;

type Props = {
  open?: boolean | null;
  onClose: () => void;
};
export const MapInfoModal = ({ open, onClose }: Props) => {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      className={s.modal}
      onClose={() => onClose()}
      header={
        <hgroup>
          <h2 className={s.title}>Map Chart: Storage Providers</h2>
        </hgroup>
      }
    >
      <ReactMarkdown className={s.description} children={mockMarkdown} />
    </Modal>
  );
};
