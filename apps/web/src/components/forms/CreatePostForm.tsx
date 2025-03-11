import RichEditor from "~/components/composites/RichEditor";

const CreatePostForm: React.FC = () => {
  return (
    <div>
      <h3>Create a post</h3>
      <div></div>
      <RichEditor
        className="border-primary rounded-b-none border-0 border-b"
        internalClassAttributes="p-0"
      />
    </div>
  );
};

export default CreatePostForm;
