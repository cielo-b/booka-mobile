import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  addNewBook,
  updateExistingBook,
  fetchBooks,
  deleteExistingBook,
} from "@/redux/book.slice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "react-native-image-picker";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  userId: string;
  photo?: string;
}

// Custom button component for consistency
const ActionButton: React.FC<{
  onPress: () => void;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}> = ({ onPress, label, icon, color = "bg-blue-500", disabled = false }) => (
  <TouchableOpacity
    className={`${color} rounded-lg py-2 px-4 flex-row items-center justify-center space-x-2 ${
      disabled ? "opacity-50" : ""
    }`}
    onPress={onPress}
    disabled={disabled}
  >
    {icon && <Ionicons name={icon as any} size={18} color="white" />}
    <Text className="text-white font-semibold">{label}</Text>
  </TouchableOpacity>
);

const CreateBookModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const pickImage = async () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 600,
        quality: 1,
      },
      (response) => {
        if (
          !response.didCancel &&
          !response.errorCode &&
          response.assets &&
          response.assets.length > 0
        ) {
          setPicture(response);
        }
      }
    );
  };

  const handleCreate = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Validation", "Title and author are required");
      return;
    }

    setIsSubmitting(true);
    try {
      let pictureFile: File | undefined;
      if (picture && picture.assets && picture.assets[0].uri) {
        pictureFile = {
          uri: picture.assets[0].uri,
          type: picture.assets[0].type || "image/jpeg",
          name: picture.assets[0].fileName || "book_cover.jpg",
        } as any;
      }

      await dispatch(
        addNewBook({ title, author, description, photo: pictureFile })
      );
      Alert.alert("Success", "Book added successfully");
      setTitle("");
      setAuthor("");
      setDescription("");
      setPicture(null);
      onClose();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to add book"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [picture, setPicture] =
    useState<ImagePicker.ImagePickerResponse | null>(null);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center bg-black/70 p-4">
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Add New Book
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50"
            placeholder="Title*"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50"
            placeholder="Author*"
            placeholderTextColor="#9ca3af"
            value={author}
            onChangeText={setAuthor}
          />
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-6 bg-gray-50 h-24"
            placeholder="Description"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View className="mb-4">
            <ActionButton
              onPress={pickImage}
              label={picture ? "Change Image" : "Pick Image"}
              icon="image"
              color="bg-green-500"
            />
            {picture && picture.assets && picture.assets[0].uri && (
              <Image
                source={{ uri: picture.assets[0].uri }}
                style={{
                  width: 100,
                  height: 150,
                  marginTop: 8,
                  borderRadius: 8,
                }}
              />
            )}
          </View>

          <View className="flex-row justify-end space-x-2">
            <ActionButton
              onPress={onClose}
              label="Cancel"
              color="bg-gray-300"
              icon="close"
            />
            <ActionButton
              onPress={handleCreate}
              label={isSubmitting ? "Adding..." : "Add Book"}
              icon="add"
              disabled={isSubmitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const UpdateBookModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  book: Book | null;
}> = ({ visible, onClose, book }) => {
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [description, setDescription] = useState(book?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [picture, setPicture] =
    useState<ImagePicker.ImagePickerResponse | null>(null);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setDescription(book.description);
      setPicture(null);
    }
  }, [book]);

  const pickImage = async () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 600,
        quality: 1,
      },
      (response) => {
        if (
          !response.didCancel &&
          !response.errorCode &&
          response.assets &&
          response.assets.length > 0
        ) {
          setPicture(response);
        }
      }
    );
  };

  const handleUpdate = async () => {
    if (!book) return;
    if (!title.trim() || !author.trim()) {
      Alert.alert("Validation", "Title and author are required");
      return;
    }

    setIsSubmitting(true);
    try {
      let pictureFile: File | undefined;
      if (picture && picture.assets && picture.assets[0].uri) {
        pictureFile = {
          uri: picture.assets[0].uri,
          type: picture.assets[0].type || "image/jpeg",
          name: picture.assets[0].fileName || "book_cover.jpg",
        } as any;
      }
      await dispatch(
        updateExistingBook(book.id, {
          title,
          author,
          description,
          photo: pictureFile,
        })
      );
      Alert.alert("Success", "Book updated successfully");
      onClose();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to update book"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center bg-black/70 p-4">
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Edit Book</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50"
            placeholder="Title*"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50"
            placeholder="Author*"
            placeholderTextColor="#9ca3af"
            value={author}
            onChangeText={setAuthor}
          />
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-6 bg-gray-50 h-24"
            placeholder="Description"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View className="mb-4">
            <ActionButton
              onPress={pickImage}
              label={picture || book?.photo ? "Change Image" : "Pick Image"}
              icon="image"
              color="bg-green-500"
            />
            {picture && picture.assets && picture.assets[0].uri ? (
              <Image
                source={{ uri: picture.assets[0].uri }}
                style={{
                  width: 100,
                  height: 150,
                  marginTop: 8,
                  borderRadius: 8,
                }}
              />
            ) : book?.photo ? (
              <Image
                source={{ uri: book.photo }}
                style={{
                  width: 100,
                  height: 150,
                  marginTop: 8,
                  borderRadius: 8,
                }}
              />
            ) : null}
          </View>

          <View className="flex-row justify-end space-x-2">
            <ActionButton
              onPress={onClose}
              label="Cancel"
              color="bg-gray-300"
              icon="close"
            />
            <ActionButton
              onPress={handleUpdate}
              label={isSubmitting ? "Updating..." : "Update Book"}
              icon="save"
              disabled={isSubmitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookList() {
  const dispatch = useDispatch<AppDispatch>();
  const { books, status, error } = useSelector(
    (state: RootState) => state.books
  );
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [dispatch]);

  const loadBooks = async () => {
    try {
      await dispatch(fetchBooks());
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteExistingBook(id));
            Alert.alert("Success", "Book deleted successfully");
          } catch (err) {
            Alert.alert(
              "Error",
              err instanceof Error ? err.message : "Failed to delete book"
            );
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-3 flex-row">
      {item.photo ? (
        <Image
          source={{ uri: item.photo }}
          style={{ width: 60, height: 90, borderRadius: 8, marginRight: 12 }}
        />
      ) : (
        <View
          style={{
            width: 60,
            height: 90,
            borderRadius: 8,
            marginRight: 12,
            backgroundColor: "#e5e7eb",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="book" size={24} color="#6b7280" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">
          {item.title}
        </Text>
        <Text className="text-gray-600 mb-1">by {item.author}</Text>
        {item.description && (
          <Text className="text-gray-500 text-sm">{item.description}</Text>
        )}
        <View className="flex-row space-x-2 mt-2">
          <TouchableOpacity
            className="bg-amber-500 p-2 rounded-lg"
            onPress={() => {
              setSelectedBook(item);
              setUpdateModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 p-2 rounded-lg"
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-800">Your Books</Text>
        <ActionButton
          onPress={() => setCreateModalVisible(true)}
          label="Add Book"
          icon="add"
        />
      </View>

      {status === "loading" && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : error ? (
        <View className="bg-red-50 p-4 rounded-lg mb-4">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-lg shadow-sm items-center">
              <Ionicons name="book" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-2">No books found</Text>
              <ActionButton
                onPress={() => setCreateModalVisible(true)}
                label="Add Your First Book"
                icon="add"
                color="bg-blue-500 mt-4"
              />
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={books.length === 0 ? { flex: 1 } : null}
        />
      )}

      <CreateBookModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
      <UpdateBookModal
        visible={updateModalVisible}
        onClose={() => {
          setUpdateModalVisible(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
