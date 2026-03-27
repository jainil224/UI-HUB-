import React from 'react';
import './SolarSystem.css';

export const SolarSystem: React.FC = () => {
    return (
        <div className="solar-system-wrapper">
            
  <div className='logo'>
    SOLAR EXPLORER
    <span>IN ONLY CSS</span>
  </div>
  <input className='planet9' id='pluto' type='radio' name='planet' />
  <label className='menu pluto' htmlFor='pluto'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Pluto
      </h2>
      <h3>39.5 AU</h3>
    </div>
  </label>
  <input className='planet8' id='neptune' type='radio' name='planet' />
  <label className='menu neptune' htmlFor='neptune'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Neptune
      </h2>
      <h3>30.06 AU</h3>
    </div>
  </label>
  <input className='planet7' id='uranus' type='radio' name='planet' />
  <label className='menu uranus' htmlFor='uranus'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Uranus
      </h2>
      <h3>19.18 AU</h3>
    </div>
  </label>
  <input className='planet6' id='saturn' type='radio' name='planet' />
  <label className='menu saturn' htmlFor='saturn'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Saturn
      </h2>
      <h3>9.539 AU</h3>
    </div>
  </label>
  <input className='planet5' id='jupiter' type='radio' name='planet' />
  <label className='jupiter menu' htmlFor='jupiter'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Jupiter
      </h2>
      <h3>5.203 AU</h3>
    </div>
  </label>
  <input className='planet4' id='mars' type='radio' name='planet' />
  <label className='mars menu' htmlFor='mars'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Mars
      </h2>
      <h3>1.524 AU</h3>
    </div>
  </label>
  <input className='planet3' id='earth' type='radio' name='planet' defaultChecked />
  <label className='earth menu' htmlFor='earth'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Earth
      </h2>
      <h3>1 AU</h3>
    </div>
  </label>
  <input className='planet2' id='venus' type='radio' name='planet' />
  <label className='menu venus' htmlFor='venus'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Venus
      </h2>
      <h3>0.723 AU</h3>
    </div>
  </label>
  <input className='planet1' id='mercury' type='radio' name='planet' />
  <label className='menu mercury' htmlFor='mercury'>
    <div className='preview'></div>
    <div className='info'>
      <h2>
        <div className='pip'></div>
        Mercury
      </h2>
      <h3>0.39 AU</h3>
    </div>
  </label>
  <div className='solar'>
    <div className='solar_systm'>
      <div className='mercury planet'>
        <div className='mercury planet_description'>
          <h2>Planet</h2>
          <h1>Mercury</h1>
          <p>The closest planet to the sun. It circles the sun faster than all the other planets, which is why Romans named it after their swift-footed messenger god.</p>
          <label htmlFor='readMercury'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='planet venus'>
        <div className='planet_description venus'>
          <h2>Planet</h2>
          <h1>Venus</h1>
          <p>Named for the Roman goddess of love and beauty. In ancient times, Venus was often thought to be two different stars, the evening star and the morning star.</p>
          <label htmlFor='readVenus'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='earth planet'>
        <div className='moon moon'>
          <h3>Moon</h3>
          <h2>Moon</h2>
        </div>
        <div className='m trajectory'></div>
        <div className='earth planet_description'>
          <h2>Planet</h2>
          <h1>Earth</h1>
          <p>Earth, our home. It is the only planet known to have an atmosphere containing free oxygen, oceans of liquid water on its surface, and, of course, life.</p>
          <label htmlFor='readEarth'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='mars planet'>
        <div className='deimos moon'>
          <h3>Moon</h3>
          <h2>Deimos</h2>
        </div>
        <div className='d trajectory'></div>
        <div className='moon phoebos'>
          <h3>Moon</h3>
          <h2>Phoebos</h2>
        </div>
        <div className='p trajectory'></div>
        <div className='mars planet_description'>
          <h2>Planet</h2>
          <h1>Mars</h1>
          <p>Fourth planet from the Sun and the second smallest planet in the solar system. Named after the Roman god of war often described as the “Red Planet”.</p>
          <label htmlFor='readMars'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='jupiter planet'>
        <div className='lo moon'>
          <h3>Moon</h3>
          <h2>Io</h2>
        </div>
        <div className='europa moon'>
          <h3>Moon</h3>
          <h2>Europa</h2>
        </div>
        <div className='ganymede moon'>
          <h3>Moon</h3>
          <h2>Ganymede</h2>
        </div>
        <div className='lop trajectory'></div>
        <div className='eu trajectory'></div>
        <div className='ga trajectory'></div>
        <div className='jupiter planet_description'>
          <h2>Planet</h2>
          <h1>Jupiter</h1>
          <p>Jupiter is the largest planet in the solar system. Fittingly, it was named after the king of the gods in Roman mythology. </p>
          <label htmlFor='readJupiter'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='planet saturn'>
        <div className='moon titan'>
          <h3>Moon</h3>
          <h2>Titan</h2>
        </div>
        <div className='dione moon'>
          <h3>Moon</h3>
          <h2>Dione</h2>
        </div>
        <div className='enceladus moon'>
          <h3>Moon</h3>
          <h2>Enceladus</h2>
        </div>
        <div className='ti trajectory'></div>
        <div className='di trajectory'></div>
        <div className='enc trajectory'></div>
        <div className='planet_description saturn'>
          <h2>Planet</h2>
          <h1>Saturn</h1>
          <p>Saturn is the sixth planet from the sun and the second largest planet in the solar system. Saturn was the Roman name for Cronus, the lord of the Titans.</p>
          <label htmlFor='readSaturn'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='planet uranus'>
        <div className='miranda moon'>
          <h3>Moon</h3>
          <h2>Miranda</h2>
        </div>
        <div className='ariel moon'>
          <h3>Moon</h3>
          <h2>Ariel</h2>
        </div>
        <div className='moon umbriel'>
          <h3>Moon</h3>
          <h2>Umbriel</h2>
        </div>
        <div className='mir trajectory'></div>
        <div className='ari trajectory'></div>
        <div className='trajectory umb'></div>
        <div className='planet_description uranus'>
          <h2>Planet</h2>
          <h1>Uranus</h1>
          <p>The first planet to be discovered by scientists. The planet is notable for its dramatic tilt, which causes its axis to point nearly directly at the sun.</p>
          <label htmlFor='readUranus'>
            <a>
              Read More
              <span>e</span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='neptune planet'>
        <div className='moon triton'>
          <h3>Moon</h3>
          <h2>Triton</h2>
        </div>
        <div className='moon proteus'>
          <h3>Moon</h3>
          <h2>Proteus</h2>
        </div>
        <div className='moon nereid'>
          <h3>Moon</h3>
          <h2>Nereid</h2>
        </div>
        <div className='trajectory tri'></div>
        <div className='pro trajectory'></div>
        <div className='ner trajectory'></div>
        <div className='neptune planet_description'>
          <h2>Planet</h2>
          <h1>Neptune</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,</p>
          <label htmlFor='readNeptune'>
            <a>
              Read More
              <span>e     </span>
            </a>
          </label>
        </div>
        <div className='overlay'></div>
      </div>
    </div>
    <div className='solar_systm'>
      <div className='planet pluto'>
        <div className='planet_description pluto'>
          <h2>Dwarf planet</h2>
          <h1>Pluto</h1>
          <p>Pluto, once considered the ninth and most distant planet from the sun, is now the largest known dwarf planet in the solar system.</p>
          <label htmlFor='readPluto'>
            <a>
              Read Moree
              <span>e     </span>
            </a>
          </label>
        </div>
        <div className='overlay'>               </div>
      </div>
    </div>
  </div>
  <input className='read' id='readMercury' type='radio' name='mercuryRead' />
  <label className='closeBig' htmlFor='closeMercury'></label>
  <input className='read' id='closeMercury' type='radio' name='mercuryRead' />
  <div className='panel'>
    <h1>Mercury</h1>
    <p>Mercury is the closest planet to the sun. As such, it circles the sun faster than all the other planets, which is why Romans named it after their swift-footed messenger god.</p>
    <p>The Sumerians also knew of Mercury since at least 5,000 years ago. It was often associated with Nabu, the god of writing. Mercury was also given separate names for its appearance as both a morning star and as an evening star. Greek astronomers knew, however, that the two names referred to the same body, and Heraclitus, around 500 B.C., correctly thought that both Mercury and Venus orbited the sun, not Earth.</p>
    <img src='https://i2.wp.com/www.astronomytrek.com/wp-content/uploads/2012/11/mercury-1.jpg?fit=678%2C381&ssl=1' />
    <h2>A year on Mercury is just 88 days long.</h2>
    <p>One solar day (the time from noon to noon on the planet’s surface) on Mercury lasts the equivalent of 176 Earth days while the sidereal day (the time for 1 rotation in relation to a fixed point) lasts 59 Earth days. Mercury is nearly tidally locked to the Sun and over time this has slowed the rotation of the planet to almost match its orbit around the Sun. Mercury also has the highest orbital eccentricity of all the planets with its distance from the Sun ranging from 46 to 70 million km.</p>
    <h2>Mercury is the smallest planet in the Solar Systm.</h2>
    <p>One of five planets visible with the naked eye a, Mercury is just 4,879 Kilometres across its equator, compared with 12,742 Kilometres for the Earth.</p>
    <h2>Mercury is the second densest planet. </h2>
    <p>Even though the planet is small, Mercury is very dense. Each cubic centimetre has a density of 5.4 grams, with only the Earth having a higher density. This is largely due to Mercury being composed mainly of heavy metals and rock.</p>
    <h2>Mercury has wrinkles.</h2>
    <p>As the iron core of the planet cooled and contracted, the surface of the planet became wrinkled. Scientist have named these wrinkles, Lobate Scarps. These Scarps can be up to a mile high and hundreds of miles long.</p>
    <br />
  </div>
  <input className='read' id='readVenus' type='radio' name='venusRead' />
  <label className='closeBig' htmlFor='closeVenus'></label>
  <input className='read' id='closeVenus' type='radio' name='venusRead' />
  <div className='panel'>
    <h1>Venus</h1>
    <p>Venus, the second planet from the sun, is named for the Roman goddess of love and beauty. The planet — the only planet named after a female — may have been named for the most beautiful deity of her pantheon because it shone the brightest of the five planets known to ancient astronomers.</p>
    <p>In ancient times, Venus was often thought to be two different stars, the evening star and the morning star — that is, the ones that first appeared at sunset and sunrise. In Latin, they were respectively known as Vesper and Lucifer. In Christian times, Lucifer, or "light-bringer," became known as the name of Satan before his fall. However, further observations of Venus in the space age show a very hellish environment. This makes Venus a very difficult planet to observe from up close, because spacecraft do not survive long on its surface.</p>
    <img src='https://3c1703fe8d.site.internapcdn.net/newman/gfx/news/hires/2014/2-whatistheave.jpg' />
    <h2>A day on Venus lasts longer than a year. </h2>
    <p>It takes 243 Earth days to rotate once on its axis (sidereal day). The planet’s orbit around the Sun takes 225 Earth days, compared to the Earth’s 365. A day on the surface of Venus (solar day) takes 117 Earth days.</p>
    <h2>Venus rotates in the opposite direction to most other planets. </h2>
    <p>This means that Venus is rotating in the opposite direction to the Sun, this is also know as a retrograde rotation. A possible reason might be a collision in the past with an asteroid or other object that caused the planet to alter its rotational path. It also differs from most other planets in our solar system by having no natural satellites.</p>
    <h2>Venus is the second brightest object in the night sky. </h2>
    <p>Only the Moon is brighter. With a magnitude of between -3.8 to -4.6 Venus is so bright it can be seen during daytime on a clear day.</p>
    <h2>Atmospheric pressure on Venus is 92 times greater than the Earth’s. </h2>
    <p>While its size and mass are similar to Earth, the small asteroids are crushed when entering its atmosphere, meaning no small craters lie on the surface of the planet. The pressure felt by a human on the surface would be equivalent to that experienced deep beneath the sea on Earth.</p>
    <br />
  </div>
  <input className='read' id='readEarth' type='radio' name='earthRead' />
  <label className='closeBig' htmlFor='closeEarth'></label>
  <input className='read' id='closeEarth' type='radio' name='earthRead' />
  <div className='panel'>
    <h1>Earth</h1>
    <p>Earth, our home, is the third planet from the sun. It is the only planet known to have an atmosphere containing free oxygen, oceans of liquid water on its surface, and, of course, life.</p>
    <p>Earth is the fifth largest of the planets in the solar system — smaller than the four gas giants, Jupiter, Saturn, Uranus and Neptune, but larger than the three other rocky planets, </p>
    <img src='https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&h=350' />
    <h2>The Earth’s rotation is gradually slowing.</h2>
    <p>This deceleration is happening almost imperceptibly, at approximately 17 milliseconds per hundred years, although the rate at which it occurs is not perfectly uniform. This has the effect of lengthening our days, but it happens so slowly that it could be as much as 140 million years before the length of a day will have increased to 25 hours.</p>
    <h2>The Earth was once believed to be the centre of the universe.</h2>
    <p>Due to the apparent movements of the Sun and planets in relation to their viewpoint, ancient scientists insisted that the Earth remained static, whilst other celestial bodies travelled in circular orbits around it. Eventually, the view that the Sun was at the centre of the universe was postulated by Copernicus, though this is also not the case.</p>
    <h2>Earth has a powerful magnetic field.</h2>
    <p>This phenomenon is caused by the nickel-iron core of the planet, coupled with its rapid rotation. This field protects the Earth from the effects of solar wind.</p>
    <h2>There is only one natural satellite of the planet Earth.</h2>
    <p>As a percentage of the size of the body it orbits, the Moon is the largest satellite of any planet in our solar system. In real terms, however, it is only the fifth largest natural satellite.</p>
    <br />
  </div>
  <input className='read' id='readMars' type='radio' name='marsRead' />
  <label className='closeBig' htmlFor='closeMars'></label>
  <input className='read' id='closeMars' type='radio' name='marsRead' />
  <div className='panel'>
    <h1>Mars</h1>
    <p>Mars is the fourth planet from the sun. Befitting the red planet's bloody color, the Romans named it after their god of war. The Romans copied the ancient Greeks, who also named the planet after their god of war, Ares. Other civilizations also typically gave the planet names based on its color — for example, the Egyptians named it "Her Desher," meaning "the red one," while ancient Chinese astronomers dubbed it "the fire star."</p>
    <img src='https://1.bp.blogspot.com/-ou7Je3OVg6U/WYtxDqjNp_I/AAAAAAAACSQ/fsopS5VtFg4bmlv8hQNfiRYfJqTygCotQCLcBGAs/s2048/Martian%2Blandscape%2Bby%2BAmante%2BLombardi.jpg' />
    <h2>Mars and Earth have approximately the same landmass.</h2>
    <p>Even though Mars has only 15% of the Earth’s volume and just over 10% of the Earth’s mass, around two thirds of the Earth’s surface is covered in water. Martian surface gravity is only 37% of the Earth’s (meaning you could leap nearly three times higher on Mars).</p>
    <h2>Mars is home to the tallest mountain in the solar system.</h2>
    <p>Olympus Mons, a shield volcano, is 21km high and 600km in diameter. Despite having formed over billions of years, evidence from volcanic lava flows is so recent many scientists believe it could still be active.</p>
    <h2>Only 18 missions to Mars have been successful.</h2>
    <p>As of September 2014 there have been 40 missions to Mars, including orbiters, landers and rovers but not counting flybys. The most recent arrivals include the Mars Curiosity mission in 2012, the MAVEN mission, which arrived on September 22, 2014, followed by the Indian Space Research Organization’s MOM Mangalyaan orbiter, which arrived on September 24, 2014. The next missions to arrive will be the European Space Agency’s ExoMars mission, comprising an orbiter, lander, and a rover, followed by NASA’s InSight robotic lander mission, slated for launch in March 2016 and a planned arrival in September, 2016.</p>
    <h2>Mars has the largest dust storms in the solar system.</h2>
    <p>They can last for months and cover the entire planet. The seasons are extreme because its elliptical (oval-shaped) orbital path around the Sun is more elongated than most other planets in the solar system.</p>
    <br />
  </div>
  <input className='read' id='readJupiter' type='radio' name='jupiterRead' />
  <label className='closeBig' htmlFor='closeJupiter'></label>
  <input className='read' id='closeJupiter' type='radio' name='jupiterRead' />
  <div className='panel'>
    <h1>Jupiter</h1>
    <p>Jupiter is the largest planet in the solar system. Fittingly, it was named after the king of the gods in Roman mythology. In a similar manner, the ancient Greeks named the planet after Zeus, the king of the Greek pantheon.</p>
    <p>Jupiter helped revolutionize the way we saw the universe and ourselves in 1610, when Galileo discovered Jupiter's four large moons — Io, Europa, Ganymede and Callisto, now known as the Galilean moons. This was the first time that celestial bodies were seen circling an object other than Earth, major support of the Copernican view that Earth was not the center of the universe.</p>
    <img src='http://hanaleikauaivacation.com/wp-content/uploads/parser/jupiter-landscape-1.jpg' />
    <h2>Jupiter is the fourth brightest object in the solar system.</h2>
    <p>Only the Sun, Moon and Venus are brighter. It is one of five planets visible to the naked eye from Earth.</p>
    <h2>The ancient Babylonians were the first to record their sightings of Jupiter.</h2>
    <p>This was around the 7th or 8th century BC. Jupiter is named after the king of the Roman gods. To the Greeks, it represented Zeus, the god of thunder. The Mesopotamians saw Jupiter as the god Marduk and patron of the city of Babylon. Germanic tribes saw this planet as Donar, or Thor.</p>
    <h2>Jupiter has the shortest day of all the planets.</h2>
    <p>It turns on its axis once every 9 hours and 55 minutes. The rapid rotation flattens the planet slightly, giving it an oblate shape.</p>
    <h2>Jupiter orbits the Sun once every 11.8 Earth years.</h2>
    <p>From our point of view on Earth, it appears to move slowly in the sky, taking months to move from one constellation to another.</p>
    <br />
  </div>
  <input className='read' id='readSaturn' type='radio' name='saturnRead' />
  <label className='closeBig' htmlFor='closeSaturn'></label>
  <input className='read' id='closeSaturn' type='radio' name='saturnRead' />
  <div className='panel'>
    <h1>Saturn</h1>
    <p>Saturn is the sixth planet from the sun and the second largest planet in the solar system. Saturn was the Roman name for Cronus, the lord of the Titans in Greek mythology. Saturn is the root of the English word "Saturday."</p>
    <p>Saturn is the farthest planet from Earth visible to the naked human eye, but it is through a telescope that the planet's most outstanding features can be seen: Saturn's rings. Although the other gas giants in the solar system — Jupiter, Uranus and Neptune — also have rings, those of Saturn are without a doubt the most extraordinary.</p>
    <img src='http://ak0.picdn.net/shutterstock/videos/4049260/thumb/1.jpg' />
    <h2>Saturn can be seen with the naked eye.</h2>
    <p>It is the fifth brightest object in the solar system and is also easily studied through binoculars or a small telescope.</p>
    <h2>Saturn was known to the ancients, including the Babylonians and Far Eastern observers.</h2>
    <p>It is named for the Roman god Saturnus, and was known to the Greeks as Cronus.</p>
    <h2>Saturn is the flattest planet.</h2>
    <p>Its polar diameter is 90% of its equatorial diameter, this is due to its low density and fast rotation. Saturn turns on its axis once every 10 hours and 34 minutes giving it the second-shortest day of any of the solar system’s planets.</p>
    <h2>Saturn orbits the Sun once every 29.4 Earth years.</h2>
    <p>Its slow movement against the backdrop of stars earned it the nickname of “Lubadsagush” from the ancient Assyrians. The name means “oldest of the old”.</p>
    <br />
  </div>
  <input className='read' id='readUranus' type='radio' name='uranusRead' />
  <label className='closeBig' htmlFor='closeUranus'></label>
  <input className='read' id='closeUranus' type='radio' name='uranusRead' />
  <div className='panel'>
    <h1>Uranus</h1>
    <p>Uranus is the seventh planet from the sun and the first to be discovered by scientists. Although Uranus is visible to the naked eye, it was long mistaken as a star because of the planet's dimness and slow orbit. The planet is also notable for its dramatic tilt, which causes its axis to point nearly directly at the sun.</p>
    <p>British astronomer William Herschel discovered Uranus accidentally on March 13, 1781, with his telescope while surveying all stars down to those about 10 times dimmer than can be seen by the naked eye. One "star" seemed different, and within a year Uranus was shown to follow a planetary orbit.</p>
    <img src='http://www.cosmosup.com/wp-content/uploads/2016/02/Uranus-Facts-About-the-Planet-Uranus-700x325.jpg' />
    <h2>Uranus was officially discovered by Sir William Herschel in 1781.</h2>
    <p>It is too dim to have been seen by the ancients. At first Herschel thought it was a comet, but several years later it was confirmed as a planet. Herscal tried to have his discovery named “Georgian Sidus” after King George III. The name Uranus was suggested by astronomer Johann Bode. The name comes from the ancient Greek deity Ouranos.</p>
    <h2>Uranus turns on its axis once every 17 hours, 14 minutes.</h2>
    <p>The planet rotates in a retrograde direction, opposite to the way Earth and most other planets turn.</p>
    <h2>Uranus makes one trip around the Sun every 84 Earth years.</h2>
    <p>During some parts of its orbit one or the other of its poles point directly at the Sun and get about 42 years of direct sunlight. The rest of the time they are in darkness.</p>
    <h2>Uranus is often referred to as an “ice giant” planet.</h2>
    <p>Like the other gas giants, it has a hydrogen upper layer, which has helium mixed in. Below that is an icy “mantle, which surrounds a rock and ice core. The upper atmosphere is made of water, ammonia and the methane ice crystals that give the planet its pale blue colour.</p>
    <br />
  </div>
  <input className='read' id='readNeptune' type='radio' name='neptuneRead' />
  <label className='closeBig' htmlFor='closeNeptune'></label>
  <input className='read' id='closeNeptune' type='radio' name='neptuneRead' />
  <div className='panel'>
    <h1>Neptune</h1>
    <p>Neptune is the eighth planet from the sun. It was the first planet to get its existence predicted by mathematical calculations before it was actually seen through a telescope on Sept. 23, 1846. Irregularities in the orbit of Uranus led French astronomer Alexis Bouvard to suggest that the gravitational pull from another celestial body might be responsible. German astronomer Johann Galle then relied on subsequent calculations to help spot Neptune via telescope. Previously, astronomer Galileo Galilei sketched the planet, but he mistook it for a star due to its slow motion. In accordance with all the other planets seen in the sky, this new world was given a name from Greek and Roman mythology — Neptune, the Roman god of the sea.</p>
    <p>Only one mission has flown by Neptune – Voyager 2 in 1989 – meaning that astronomers have done most studies using ground-based telescopes. Today, there are still many mysteries about the cool, blue planet, such as why its winds are so speedy and why its magnetic field is offset.</p>
    <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy8Dd14tbXAzh1iz-EJl9tulRwH7Bb-SxX6sXpKFDbqb-NKwpE' />
    <h2>Neptune was not known to the ancients.</h2>
    <p>It is not visible to the naked eye and was first observed in 1846. Its position was determined using mathematical predictions. It was named after the Roman god of the sea.</p>
    <h2>Neptune spins on its axis very rapidly.</h2>
    <p>Its equatorial clouds take 18 hours to make one rotation. This is because Neptune is not solid body.</p>
    <h2>Neptune is the smallest of the ice giants.</h2>
    <p>Despite being smaller than Uranus, Neptune has a greater mass. Below its heavy atmosphere, Uranus is made of layers of hydrogen, helium, and methane gases. They enclose a layer of water, ammonia and methane ice. The inner core of the planet is made of rock.</p>
    <h2>The atmosphere of Neptune is made of hydrogen and helium, with some methane.</h2>
    <p>The methane absorbs red light, which makes the planet appear a lovely blue. High, thin clouds drift in the upper atmosphere.</p>
  </div>
  <input className='read' id='readPluto' type='radio' name='plutoRead' />
  <label className='closeBig' htmlFor='closePluto'></label>
  <input className='read' id='closePluto' type='radio' name='plutoRead' />
  <div className='panel'>
    <h1>Pluto</h1>
    <p>Pluto, once considered the ninth and most distant planet from the sun, is now the largest known dwarf planet in the solar system. It is also one of the largest known members of the Kuiper Belt, a shadowy zone beyond the orbit of Neptune thought to be populated by hundreds of thousands of rocky, icy bodies each larger than 62 miles (100 kilometers) across, along with 1 trillion or more comets. </p>
    <p>In 2006, Pluto was reclassified as a dwarf planet, a change widely thought of as a demotion. The question of Pluto's planet status has attracted controversy and stirred debate in the scientific community, and among the general public, since then. In 2017, a science group (including members of the New Horizon mission) proposed a new definition of planethood based on "round objects in space smaller than stars," which would make the number of planets in our solar system expand from 8 to roughly 100.</p>
    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/asd.jpeg' />
    <h2>Pluto is named after the Greek god of the underworld.</h2>
    <p>This is a later name for the more well known Hades and was proposed by Venetia Burney an eleven year old schoolgirl from Oxford, England.</p>
    <h2>Pluto was reclassified from a planet to a dwarf planet in 2006.</h2>
    <p>This is when the IAU formalised the definition of a planet as “A planet is a celestial body that (a) is in orbit around the Sun, (b) has sufficient mass for its self-gravity to overcome rigid body forces so that it assumes a hydrostatic equilibrium (nearly round) shape, and (c) has cleared the neighbourhood around its orbit.”</p>
    <h2>Pluto was discovered on February 18th, 1930 by the Lowell Observatory.</h2>
    <p>For the 76 years between Pluto being discovered and the time it was reclassified as a dwarf planet it completed under a third of its orbit around the Sun.</p>
    <h2>Pluto has five known moons.</h2>
    <p>The moons are Charon (discovered in 1978,), Hydra and Nix (both discovered in 2005), Kerberos originally P4 (discovered 2011) and Styx originally P5 (discovered 2012) official designations S/2011 (134340) 1 and  S/2012 (134340) 1.</p>
  </div>

        </div>
    );
};

export default SolarSystem;
