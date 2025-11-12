"use client";



import { CldUploadWidget } from "next-cloudinary";

import { useEffect, useState } from "react";



import { Button } from "@/components/ui/button";

import Image from "next/image";

import { LuImagePlus as ImagePlus, LuTrash2 as Trash } from "react-icons/lu";



// 💡 Change 1: Update the prop signature to accept and return an array of strings

interface ImageUploadProps {

  disabled?: boolean;

  onChange: (values: string[]) => void; // Now handles an array of URLs

  onRemove: (value: string) => void;

  value: string[];

}



const ImageUpload: React.FC<ImageUploadProps> = ({

  disabled,

  onChange,

  onRemove,

  value,

}) => {

  const [isMounted, setIsMounted] = useState(false);



  useEffect(() => {

    setIsMounted(true);

  }, []);



  // 💡 Change 2: Handle the upload result. When 'multiple' is true, the widget

  // triggers 'onSuccess' for *each* image upload. To handle this, we temporarily

  // append the new URL to the current `value` array before calling `onChange`.

  const onUpload = (result: any) => {

    const newUrl = result.info.secure_url;

    

    // Send the new combined array of URLs back to the parent form.

    onChange([...value, newUrl]);

  };



  if (!isMounted) {

    return null;

  }



  return (

    <div>

      <div className="mb-4 flex items-center gap-4">

        {value.map((url) => (

          <div

            key={url}

            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"

          >

            <div className="z-10 absolute top-2 right-2">

              <Button

                type="button"

                onClick={() => onRemove(url)}

                variant="destructive"

                size="sm"

              >

                <Trash className="h-4 w-4" />

              </Button>

            </div>

            <Image fill className="object-cover" alt="Image" src={url} />

          </div>

        ))}

      </div>

      <CldUploadWidget 

        onSuccess={onUpload} 

        uploadPreset="my_widget_preset"

        // 💡 Change 3: Set 'multiple' option to true in the widget configuration

        options={{

          multiple: true, 

          maxFiles: 10, // Optional: Limit the number of files

        }}

      >

        {({ open }) => {

          const onClick = () => {

            open();

          };



          return (

            <Button

              type="button"

              disabled={disabled}

              variant="secondary"

              onClick={onClick}

            >

              <ImagePlus className="h-4 w-4 mr-2" />

              Upload Images

            </Button>

          );

        }}

      </CldUploadWidget>

    </div>

  );

};



export default ImageUpload;