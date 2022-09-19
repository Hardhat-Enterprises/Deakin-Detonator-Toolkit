import { Image, Text, Accordion, useMantineTheme, Stack, Title } from "@mantine/core";
import { IconStepInto, IconTools, IconSearch, IconTarget } from "@tabler/icons";

const AboutPage = () => {
  const theme = useMantineTheme();
  const getColor = (color: string) => theme.colors[color][theme.colorScheme === 'dark' ? 5 : 7];

  return (
    <>
      <Stack align={"center"}>
        <Title>About the Deakin Detonator Toolkit</Title>
        <Text>In it's simplest definition, Deakin Detonator Toolkit is a penetration testing toolkit.</Text>
        <Text>Made by university students, DDT is our capstone project, completed over successive trimesters.</Text>
        <Text>
          The toolkit allows you to make use of a variety of tools, without needing the "know-how" of each
          command.
        </Text>
        <Text>
          We have simplified the penetration testing experience for both newcomers who are still learning and
          those who have been hacking for years.
        </Text>
        <Text>
          Learn more about what the Deakin Detonator Toolkit provides down below:
        </Text>
        <Text></Text>
      </Stack>

      <Accordion variant="contained">
        <Accordion.Item value="Tools">
          <Accordion.Control icon={<IconTools size={16} color={getColor('violet')} />}>
            Tools
          </Accordion.Control>
          <Accordion.Panel>
            <div style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}>
              <Image
                radius="md"
                src="static/tools_page_screenshot.png"
                alt="Random unsplash image"
              />
            </div>
            <p><Text align={"center"}>The Tools page of the Deakin Detonator Toolkit provides you with a list of different tools and controls for Cyber Security analyses. These tools can support network scanning, password cracking and much more. To explore this section of the Deakin Detonator Toolkit further, press on the "Tools" category displayed on the left-hand navigation bar.
            </Text></p>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="AttackVectors">
          <Accordion.Control icon={<IconTarget size={16} color={getColor('red')} />}>
            Attack Vectors
          </Accordion.Control>
          <Accordion.Panel>
            <div style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}>
              <Image
                radius="md"
                src="static/attackvectors_page_screenshot.png"
                alt="Random unsplash image"
              />
            </div>
            <p><Text align={"center"}>The Attack Vectors page of the Deakin Detonator Toolkit provides you with a list of different exploits that can be used to infiltrate various operating systems. To explore this section of the Deakin Detonator Toolkit further, press on the "Attack Vectors" category displayed on the left-hand navigation bar.
            </Text></p>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="Walkthroughs">
          <Accordion.Control icon={<IconStepInto size={16} color={getColor('blue')} />}>
            Walkthroughs
          </Accordion.Control>
          <Accordion.Panel>
            <div style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}>
              <Image
                radius="md"
                src="static/walkthroughs_page_screenshot.png"
                alt="Random unsplash image"
              />
            </div>
            <p><Text align={"center"}>The Walkthroughs page of the Deakin Detonator Toolkit provides you with a list of tutorial videos. These tutorial videos can provide an explanation on how to use some of the Tools and Attack Vectors listed on the Deakin Detonator Toolkit. To explore this section of the Deakin Detonator Toolkit further, press on the "Walkthroughs" category displayed on the left-hand navigation bar.
            </Text></p>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="References">
          <Accordion.Control icon={<IconSearch size={16} color={getColor('green')} />}>
            References
          </Accordion.Control>
          <Accordion.Panel>
            <div style={{ width: 400, marginLeft: "auto", marginRight: "auto" }}>
              <Image
                radius="md"
                src="static/references_page_screenshot.png"
                alt="Random unsplash image"
              />
            </div>
            <p><Text align={"center"}>The References page of the Deakin Detonator Toolkit provides you with a list of sources that were used to help create the Deakin Detonator Toolkit and its contents. These sources may provide a further understanding to the tools, attack vectors and walkthrough videos within the Deakin Detonator Toolkit. To explore this section of the Deakin Detonator Toolkit further, press on the "References" category displayed on the left-hand navigation bar.
            </Text></p>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );

};

export default AboutPage;
