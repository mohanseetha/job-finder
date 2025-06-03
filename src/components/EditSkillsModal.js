import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Stack,
  Input,
  IconButton,
  Badge,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

const MIN_SKILLS = 3;

const EditSkillsModal = ({ isOpen, onClose, skills, onSave, loading }) => {
  const [localSkills, setLocalSkills] = useState(skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  const cardBgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    setLocalSkills(skills || []);
    setNewSkill("");
    setError("");
  }, [skills, isOpen]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (localSkills.includes(trimmed)) {
      setError("Skill already added.");
      return;
    }
    setLocalSkills([...localSkills, trimmed]);
    setNewSkill("");
    setError("");
  };

  const handleRemoveSkill = (idx) => {
    setLocalSkills(localSkills.filter((_, i) => i !== idx));
    setError("");
  };

  const handleSave = () => {
    if (localSkills.length < MIN_SKILLS) {
      setError(`Please add at least ${MIN_SKILLS} skills.`);
      return;
    }
    onSave(localSkills);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        maxW={{ base: "95vw", sm: "400px" }}
        w="100%"
        borderRadius="xl"
        bg={cardBgColor}
      >
        <ModalHeader>Edit Skills</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={{ base: 2, sm: 6 }}>
          <FormControl isInvalid={!!error}>
            <FormLabel>Skills (min {MIN_SKILLS})</FormLabel>
            <Stack direction="row" mb={2} spacing={2}>
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <IconButton
                icon={<AddIcon />}
                colorScheme="blue"
                onClick={handleAddSkill}
                aria-label="Add skill"
                isDisabled={!newSkill.trim()}
              />
            </Stack>
            <Stack direction="row" wrap="wrap" spacing={2}>
              {localSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  colorScheme="green"
                  fontSize="0.95em"
                  px={2}
                  py={1}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  {skill}
                  <IconButton
                    icon={<DeleteIcon />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    ml={1}
                    aria-label="Remove skill"
                    onClick={() => handleRemoveSkill(idx)}
                    isDisabled={localSkills.length <= MIN_SKILLS}
                  />
                </Badge>
              ))}
            </Stack>
            {error && <FormErrorMessage mt={2}>{error}</FormErrorMessage>}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={loading}
            isDisabled={localSkills.length < MIN_SKILLS}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditSkillsModal;
